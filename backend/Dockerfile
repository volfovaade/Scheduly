FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# restore dependencies
#COPY *.csproj ./
#RUN dotnet restore
COPY backend/backend.csproj ./backend/
RUN dotnet restore ./backend/backend.csproj

# Copy backend source
COPY backend/ ./backend/
#COPY . ./

# Build and publish backend app (without tests)
WORKDIR /src/backend
RUN dotnet publish ./backend.csproj -c Release -o /app/publish
#RUN dotnet publish -c Release -o /app/publish

# runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80

ENTRYPOINT ["dotnet", "backend.dll"]