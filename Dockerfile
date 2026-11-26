# Build the Svelte admin bundle used by the ASP.NET /admin routes.
FROM node:20-alpine AS admin-build
WORKDIR /src/admin
COPY admin/package.json ./
RUN npm install --no-audit --no-fund
COPY admin/ ./
RUN npm run build

# Build the .NET 8 website backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish Roblox/Roblox.Website/Roblox.Website.csproj -c Release -o /app/publish

# Small ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish ./
# Serve the Kandi frontend directly from the Pekora ASP.NET application.
COPY --from=build /src/frontend ./frontend
COPY --from=build /src/api/public ./api/public
COPY --from=admin-build /src/admin/public ./admin/public
COPY --from=build /src/RCCService/RCCService2020/internalscripts/thumbnails ./RCCService/RCCService2020/internalscripts/thumbnails
COPY --from=build /src/Roblox/Roblox.Libraries/Templates ./Roblox/Roblox.Libraries/Templates
COPY --from=build /src/Roblox/Roblox.Libraries/Json ./Roblox/Roblox.Libraries/Json
COPY --from=build /src/game-server/scripts ./game-server/scripts
COPY --from=build /src/Roblox/Roblox.Website/game-servers.json ./game-servers.json
RUN mkdir -p /app/storage/asset /app/api/public/images/thumbnails /app/api/public/images/groups /app/scripts /app/rcc-lua /app/economy-chat/build
EXPOSE 10000
ENTRYPOINT ["dotnet", "Roblox.Website.dll"]
