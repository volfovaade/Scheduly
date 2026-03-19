#for digital ocean production build from root directory already backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend.csproj ./backend/
RUN dotnet restore ./backend/backend.csproj

COPY . ./backend/

WORKDIR /src/backend
RUN dotnet publish ./backend.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"]
#FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
#WORKDIR /src

# restore dependencies
#COPY backend/backend.csproj ./backend/
#RUN dotnet restore ./backend/backend.csproj

# Copy backend source
#COPY backend/ ./backend/

# Build and publish backend app (without tests)
#WORKDIR /src/backend
#RUN dotnet publish ./backend.csproj -c Release -o /app/publish

# runtime image
#FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
#WORKDIR /app
#COPY --from=build /app/publish .

#EXPOSE 80

#ENTRYPOINT ["dotnet", "backend.dll"]