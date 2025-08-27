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
- Frontend postavený v React s Tailwind CSS, Axios a Auth Context

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
# pro development:  docker-compose -f docker-compose.dev.yml up --build
```
Docker automaticky spustí backend, frontend a PostgreSQL databázi.
Frontend bude dostupný na portu definovaném v .env

---

## ⚙️ Konfigurace aplikace
Aplikace využívá 2 typy .env souborů:
- .env - společné proměnné
- backend/.env - proměnné specifické pro backend
Pro konfiguraci použijte následující šablony pro jednotlivé soubory:

### 1. backend/.env
Do adresáře backend přidejte soubor .env a ujistěte se, že máte nastavené klíče.
```bash
# JWT Configuration (at least 512b)
JWT_KEY="YOUR_OWN_KEY"

# Google API
GOOGLE_API_KEY="YOUR_OWN_API_KEY"

```

### .env
Do adresáře projektu přidejte soubor .env.

```bash
# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=planner
DB_HOST=db
DB_PORT=5432

# Backend API configuration
BACKEND_HOST=localhost
BACKEND_PORT=8081
BACKEND_URL=http://localhost:8081

# Frontend configuration
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
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

---

## 📌 Požadavky

- .NET 8 SDK
- Docker
- Google Places API Key

## Project status
There is still a lot to work on. For now it is just a skeleton.