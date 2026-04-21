using backend.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Text.Json;

namespace backend.Services
{
    /// <summary>
    /// Service for searching nearby places using Google Places API.
    /// </summary>
    public class GooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GooglePlacesService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY")!;  // already validated in Program.cs
        }
        /// <summary>
        /// Searches for nearby places of specified type using Google Places API.
        /// Returns up to 3 closest places ranked by distance.
        /// </summary>
        /// 
        /// <param name="type">Place type (e.g. "restaurant", "cafe")</param>
        /// <param name="lat">Latitude coordinate</param>
        /// <param name="lng">Longitude coordinate</param>
        /// <param name="eventId">Event ID to associate with found places</param>
        /// <param name="fromTime">Start time for the place option</param>
        /// <param name="toTime">End time for the place option</param>
        /// <param name="minRating">Minimal rating for the place location</param>
        /// <param name="priceLevel">Chosen price category</param>
        /// <returns>List of generated place options</returns>
        public async Task<List<EventOption>> SearchPlacesAsync(
            string type, double lat, double lng, Guid eventId,
            DateTimeOffset fromTime, DateTimeOffset toTime,
            PriceLevel priceLevel = PriceLevel.Any, double minRating = 0.0)
        {

            // build Google Places API URL - using distance ranking
            var url = $"https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
                      $"?location={lat},{lng}" +
                      $"&type={type}" +
                      $"&rankby=distance" +
                      $"&language=en" +
                      $"&key={_apiKey}";

            if (priceLevel != PriceLevel.Any)
                url += $"&maxprice={(int)priceLevel}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return new List<EventOption>();
            }

            // parse JSON response
            var json = await response.Content.ReadAsStringAsync();
            // deserialize API response
            var data = JsonSerializer.Deserialize<GooglePlaceResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            var validPlaces = new List<EventOption>();

            // for each place get details and check opening hours in required time
            foreach (var place in data?.Results?.Take(20) ?? Enumerable.Empty<GooglePlace>())
            {
                // check if place type is valid
                if (!IsValidPlace(place, type))
                    continue;

                // check quality requirements
                if (!MeetsQualityRequirements(place, minRating))
                    continue;

                validPlaces.Add(new EventOption
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    Source = OptionSource.Generated,
                    PlaceName = place.Name,
                    Address = place.Vicinity,
                    Latitude = place.Geometry.Location.Lat,
                    Longitude = place.Geometry.Location.Lng,
                    TimeFrom = fromTime,
                    TimeTo = toTime
                });

                if (validPlaces.Count >= 3)
                    break;
            }

            return validPlaces;

            //// convert Google API results to our model(take only first 3) -> might be better to do some more random algorithm
            //var results = data?.Results?.Take(3)
            //    .Select(r => new EventOption
            //    {
            //        Id = Guid.NewGuid(),
            //        EventId = eventId,
            //        Source = OptionSource.Generated,
            //        PlaceName = r.Name,
            //        Address = r.Vicinity,
            //        Latitude = r.Geometry.Location.Lat,
            //        Longitude = r.Geometry.Location.Lng,
            //        TimeFrom = fromTime,
            //        TimeTo = toTime
            //    })
            //    .ToList() ?? new();

            //return results;
        }

        private bool MeetsQualityRequirements(GooglePlace place, double minRating)
        {
            // if rating is required and place has no rating, exclude it
            if (minRating > 0 && (place.Rating == null || place.Rating < minRating))
                return false;

            // exclude places with very few reviews (unreliable)
            if (place.UserRatingsTotal != null && place.UserRatingsTotal < 5)
                return false;

            return true;
        }

        private bool IsValidPark(string name, List<string> types)
        {
            // exclude cemeteries disguised as parks
            if (name.Contains("cemetery") || name.Contains("memorial park") ||
                name.Contains("rest park") || name.Contains("peace park"))
                return false;

            if (name.Contains("dog park") || name.Contains("dog run"))
                return false;

            // exclude parking lots
            if (name.Contains("parking") || name.Contains("car park"))
                return false;

            // exclude industrial parks
            if (name.Contains("industrial park") || name.Contains("business park") ||
                name.Contains("office park") || name.Contains("technology park"))
                return false;

            if (name.Contains("amusement park") || name.Contains("theme park") ||
                name.Contains("water park") || name.Contains("adventure park"))
                return false;

            return true;
        }

        private bool IsValidCafe(string name, List<string> types)
        {
            // exclude mobile/temporary cafes
            if (name.Contains("mobile") || name.Contains("truck") ||
                name.Contains("cart") || name.Contains("stand") ||
                name.Contains("kiosk") || name.Contains("pop-up") ||
                name.Contains("popup") || name.Contains("temporary"))
                return false;

            // exclude delivery-only or takeaway-only
            if (types.Contains("meal_delivery") && !types.Contains("cafe"))
                return false;

            // exclude vending machine "cafes"
            if (name.Contains("vending") || name.Contains("automat"))
                return false;

            if (name.Contains("hospital cafe") || name.Contains("airport cafe") ||
                name.Contains("station cafe"))
                return false;

            return true;
        }

        private bool IsValidRestaurant(string name, List<string> types)
        {
            // exclude delivery/takeaway only
            if (types.Contains("meal_delivery") && !types.Contains("restaurant"))
                return false;
            if (name.Contains("delivery only"))
                return false;

            if (types.Contains("meal_takeaway") &&
                !types.Contains("restaurant") &&
                !types.Contains("cafe"))
                return false;

            // exclude food trucks and mobile vendors
            if (types.Contains("food_truck") ||
                name.Contains("food truck") ||
                name.Contains("mobile kitchen") ||
                name.Contains("street food") ||
                name.Contains(" cart") ||
                name.Contains("vendor"))
                return false;

            // exclude cafeterias in institutions
            if (name.Contains("cafeteria") &&
                (name.Contains("hospital") || name.Contains("school") ||
                 name.Contains("office")))
                return false;

            return true;
        }

        private bool IsValidBar(string name, List<string> types)
        {
            if (types.Contains("liquor_store") && !types.Contains("bar"))
                return false;

            if (name.Contains("package store") || name.Contains("bottle shop"))
                return false;

            return true;
        }

        private bool IsValidLodging(string name, List<string> types)
        {
            // hotels are generally good, but exclude:
            if (name.Contains("extended stay") ||
                name.Contains("apartment") ||
                name.Contains("residence inn"))
                return false;

            // usually not event-friendly
            if (name.Contains("motel") && name.Contains("highway"))
                return false;

            return true;
        }

        private bool IsValidCamping(string name, List<string> types)
        {
            if (name.Contains("rv sales") ||
                name.Contains("rv service") ||
                name.Contains("rv repair"))
                return false;

            if (name.Contains("overnight parking") && !name.Contains("campground"))
                return false;

            return true;
        }

        private bool IsValidMuseum(string name, List<string> types)
        {
            // museums are generally good
            return true;
        }

        private bool IsValidCinema(string name, List<string> types)
        {
            // cinemas are usually fine
            return true;
        }

        private bool IsValidShoppingMall(string name, List<string> types)
        {
            if (name.Contains("closed") || name.Contains("former"))
                return false;

            return true;
        }

        private bool IsValidSportsVenue(string name, List<string> types)
        {
            // exclude private gyms
            if (types.Contains("gym") &&
                (name.Contains("crossfit") ||
                 name.Contains("private") ||
                 name.Contains("members only")))
                return false;

            // keep public sports centers and stadiums
            return true;
        }

        private bool IsValidPlace(GooglePlace place, string type)
        {
            var name = place.Name.ToLower();
            var types = place.Types?.Select(t => t.ToLower()).ToList() ?? new List<string>();

            // GLOBAL BLACKLIST - never suitable for events
            var globalBlacklistTypes = new[] {
                "cemetery", "funeral_home", "crematorium",
        
                "parking", "car_rental", "car_repair", "car_dealer", "car_wash",
                "gas_station", "transit_station", "bus_station", "train_station",
                "subway_station", "taxi_stand", "airport",
        
                "atm", "bank", "accounting", "insurance_agency",
        
                "hospital", "pharmacy", "dentist", "doctor", "physiotherapist",
                "veterinary_care", "health",
        
                "courthouse", "embassy", "fire_station", "local_government_office",
                "police", "post_office", "city_hall",
        
                "church", "mosque", "synagogue", "hindu_temple", "place_of_worship",
        
                "locksmith", "plumber", "electrician", "roofing_contractor",
                "moving_company", "painter", "laundry", "hair_care", "beauty_salon",
        
                "storage", "warehouse",
        
                "real_estate_agency",
        
                "school", "primary_school", "secondary_school", "university"
            };

            if (types.Any(t => globalBlacklistTypes.Contains(t)))
                return false;

            var nameBlacklist = new[] {
                "cemetery", "funeral", "crematorium", "morgue", "grave", "memorial",
        
                "parking", "garage", "car park", "parking lot", "bus stop", "station",
                "airport", "terminal",
        
                "gas station", "petrol", "fuel", "car wash", "auto repair", "mechanic",
                "tire", "tyre", "auto parts", "service station",
        
                "hospital", "clinic", "medical", "pharmacy", "drug store", "dentist",
                "dental", "veterinary", "vet clinic", "emergency room", "urgent care",
        
                "police", "fire station", "courthouse", "city hall", "dmv", "post office",
                "embassy", "consulate",
        
                "church", "chapel", "cathedral", "mosque", "temple", "synagogue",
        
                "warehouse", "storage", "industrial",
        
                "mobile", "truck", "cart", "stand", "kiosk", "vending",
        
                "elementary school", "high school", "middle school", "kindergarten",
        
                "atm", " bank", "credit union"
            };

            if (nameBlacklist.Any(banned => name.Contains(banned)))
                return false;

            switch (type)
            {
                case "park":
                    return IsValidPark(name, types);

                case "cafe":
                    return IsValidCafe(name, types);

                case "restaurant":
                    return IsValidRestaurant(name, types);

                case "bar":
                case "night_club":
                    return IsValidBar(name, types);

                case "lodging":
                    return IsValidLodging(name, types);

                case "campground":
                case "rv_park":
                    return IsValidCamping(name, types);

                case "museum":
                case "art_gallery":
                    return IsValidMuseum(name, types);

                case "movie_theater":
                    return IsValidCinema(name, types);

                case "shopping_mall":
                    return IsValidShoppingMall(name, types);

                case "gym":
                case "stadium":
                    return IsValidSportsVenue(name, types);
            }

            return true;
        }

    }
}