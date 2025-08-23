# ![Logo](docs/badge.png) Scheduly - event planning app

Scheduly je webová aplikace postavená na **ASP.NET Core Web API** určená pro plánování událostí a doporučování míst.  
Aplikace umožňuje spravovat uživatele, jejich preference a získávat doporučení lokalit pomocí integrace s **Google Places API** a **OpenStreetMaps**.

---

## 🚀 Funkce

- Registrace a přihlášení uživatelů (JWT autentifikace)
- Bezpečné ukládání hesel pomocí **BCrypt**
- Vyhledávání a doporučování lokalit přes **Google Places API**
- Podpora více databází (**PostgreSQL** / **SQL Server**)
- Připraveno pro běh v **Dockeru**

---

## 🛠️ Instalace a spuštění

### 1. Klonování repozitáře

```bash
git clone https://gitlab.mff.cuni.cz/volfovaade/eventplanner.git
cd eventplanner
```

### 2. Spuštění pomocí Dockeru
```bash
docker compose up --build
```

---

## ⚙️ Konfigurace aplikace
Aplikace používá soubor appsettings.json pro konfiguraci. Do adresáře backend tedy přidejte vlastní appsettings.json. Předloha zde:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db;Database=planner;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "!!!PUT_HERE_YOUR_OWN_KEY!!!"
  },
  "GoogleApiKey": "!!!PUT_HERE_YOUR_OWN_API_KEY!!!",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## 📝 Co je potřeba nastavit ručně

### 1. JWT klíč

Slouží pro podepisování a ověřování tokenů. Měl by mít alespoň 512 bitů. Bezpečně si ho vygeneruješ v C# například takto:
```csharp
var key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
Console.WriteLine(key);
```

### 2. Google API Key

Potřebuješ vlastní Google Places API klíč. Získáš ho v Google Cloud Console. Klíč vlož do GoogleApiKey v appsettings.json.

### 3. Connection string

Pro Docker je již přednastaveno:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db;Database=planner;Username=postgres;Password=postgres"
  }
}
```

Pokud spouštíš aplikaci lokálně bez Dockeru:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=planner;Username=postgres;Password=postgres"
  }
}
```

---

## 📌 Požadavky

- .NET 8 SDK
- Docker
- Google Places API Key

## Project status
There is still a lot to work on. For now it is just a skeleton.