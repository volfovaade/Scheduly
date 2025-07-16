FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# restore dependencies
COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

# runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80

ENTRYPOINT ["dotnet", "EventPlanner.Backend.dll"]