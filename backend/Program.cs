using backend.Data;
using backend.Database;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// loading environment variables and validation
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
            ?? throw new InvalidOperationException("JWT Key not configured");

var googleApiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY")
                  ?? throw new InvalidOperationException("Google API Key not configured");

// build connection string from environment variables or use default
var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "db";
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
var dbName = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "planner";
var dbUser = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
var dbPassword = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";

var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword}";

// Add controllers and configure JSON serialization
// JsonStringEnumConverter => serialize enums as strings (e.g. "cafe") instead of numeric values
builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); 
});

// API documentation and Swagger UI setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

// Configure CORS policy
// Allows frontend requests from given origins with any header and method
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Entity Framework Core with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure JWT authentication (Bearer token in the Authorization header)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,  // verify token signature
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false, // skip issuer and audience validation
            ValidateAudience = false
        };
    });

// Register application services into DI container
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEventService, EventService>();  // core business logic for events

// Register Google Places API service:
// AddHttpClient => provide HttpClient with automatic disposal and configuration
// AddScoped => service lifetime matches a single HTTP request
builder.Services.AddHttpClient<GooglePlacesService>();
builder.Services.AddScoped<GooglePlacesService>();

// enable authorization policies
builder.Services.AddAuthorization();

var app = builder.Build();

// Apply database migrations at startup and initialize data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();  // apply any pending EF migrations
    await DbInitializer.InitializeAsync(context);  // seed initial data
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Scheduly API v1");
        options.RoutePrefix = string.Empty; // Swagger will be available at ${BACKEND_URL}
    });
}

app.UseCors();  // enable CORS for all incoming requests

app.UseAuthentication();  // enable authentication and authorization middleware
app.UseAuthorization();
app.MapControllers();  // map controllers to endpoints

app.Run();