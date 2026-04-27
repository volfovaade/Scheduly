# ![Logo](docs/badge.png) Scheduly — Group Event Planning App

Scheduly is a web application for organizing group events. It helps participants coordinate the best time and place to meet by collecting preferences, aggregating them, and automatically generating optimal options using **Google Places API**.

Live demo: **[scheduly-silk.vercel.app](https://scheduly-silk.vercel.app)**

---

## Features

- **6 event types** — from simple fixed events to fully open ones where the app finds both the best time and place
- **3 event phases** — Proposal → Final Voting → Closed
- Time preference collection with overlap detection (hourly slots or day selection for multi-day events)
- Location preference collection with map-based input (OpenStreetMap via Leaflet)
- Automatic place generation via **Google Places API** based on aggregated preferences
- JWT authentication + BCrypt password hashing
- Role-based access control (Admin / Organizer / Participant)
- Email notifications (registration, password reset, event closed/cancelled, deadline reminders)
- Automatic cancellation of events with expired time range
- Dark mode support
- Fully containerized with **Docker**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8, Entity Framework Core, Clean Architecture |
| Frontend | React 18, TypeScript, Tailwind CSS, Axios, react-leaflet |
| Database | PostgreSQL 15 |
| Email | MailKit (Gmail SMTP) |
| Infrastructure | Docker, Docker Compose |
| Deployment | DigitalOcean App Platform (backend), Vercel (frontend) |

---

## Local Development

### 1. Clone the repository

```bash
git clone https://gitlab.mff.cuni.cz/volfovaade/eventplanner.git
cd eventplanner
```

### 2. Create environment files

**`.env`** (root directory):
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=planner
DB_HOST=db
DB_PORT=5432

# Backend
BACKEND_HOST=localhost
BACKEND_PORT=8081
BACKEND_URL=http://localhost:8081

# Frontend
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
REACT_APP_API_BASE_URL=http://localhost:8081/api
```

**`backend/.env`** (backend-specific secrets):
```env
# Admin account (created automatically on first run)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_strong_password
ADMIN_NAME=Admin

# JWT — minimum 32 characters
JWT_KEY=your_minimum_32_character_secret_key

# Google Places API
GOOGLE_API_KEY=your_google_api_key

# SMTP (Gmail with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_gmail@gmail.com
```

> Both `.env` files are listed in `.gitignore` and must never be committed to version control.

### 3. Start the development environment

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend + Swagger UI:** http://localhost:8081
- **PostgreSQL:** localhost:5432

Database migrations and the default admin account are created automatically on first start.

---

## Production Build

```bash
docker compose up --build
```

> **Note:** The production `backend/Dockerfile` is configured for **DigitalOcean App Platform**, where the build context root is the `backend/` folder itself (not the project root). If running locally, paths in `COPY` commands need to be adjusted — see [Deployment](#-deployment) below.

---

## Project Structure

```
eventplanner/
├── backend/
│   ├── Dockerfile          # production image (DigitalOcean — root is backend/)
│   ├── Dockerfile.dev      # development image with dotnet watch
│   └── .env                # (not committed)
├── backend.Tests/
│   └── ...                 # xUnit unit tests
├── frontend/
│   ├── Dockerfile          # production image (nginx)
│   ├── Dockerfile.dev      # development image (Node dev server)
│   └── nginx.conf          # React Router support
├── docker-compose.yml      # production orchestration
├── docker-compose.dev.yml  # development orchestration with hot reload
└── .env                    # (not committed)
```

---

## Deployment

The app is deployed using:
- **[Vercel](https://vercel.com)** — frontend (root directory: `frontend/`)
- **[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)** — backend (source directory: `backend/`)
- **[DigitalOcean Managed PostgreSQL](https://docs.digitalocean.com/products/databases/postgresql)** — database

### Important: Dockerfile path differences

Because DigitalOcean sets `backend/` as the build root, the production `Dockerfile` uses paths **without** the `backend/` prefix:

```dockerfile
# DigitalOcean (backend/ is the root — paths without prefix)
COPY *.csproj ./
COPY . .
```

If you want to run the production build **locally** from the project root, you need to adjust the paths:

```dockerfile
# Local (project root is the build context — paths with prefix)
COPY backend/*.csproj backend/
COPY backend/ backend/
```

The backend listens on port **8080** as required by DigitalOcean App Platform:

```dockerfile
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
```

---

## Getting a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable **Places API (legacy)**
3. Generate an API key and paste it into `GOOGLE_API_KEY` in `backend/.env`

## Setting up Gmail SMTP

Gmail requires an **App Password** instead of your regular password:

1. Go to [myaccount.google.com](https://myaccount.google.com) → Security
2. Enable 2-Step Verification
3. Go to **App passwords** and generate a new one
4. Paste the 16-character code into `SMTP_PASSWORD` in `backend/.env`

---

## Testing

Unit tests are located in `backend.Tests/` and use **xUnit** + **Moq**:

```bash
cd backend.Tests
dotnet test
```

End-to-end tests use **Cypress** (requires the dev environment to be running):

```bash
cd frontend
npx cypress open
```

---

## Database Management

**Reset local database** (deletes all data):
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

**View logs:**
```bash
docker compose logs -f backend
```