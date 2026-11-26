FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /src
COPY ["./Roblox/", "/src/"]
RUN dotnet restore "/src/Roblox.IntegrationTest/Roblox.IntegrationTest.csproj" && \
    dotnet build "/src/Roblox.IntegrationTest/Roblox.IntegrationTest.csproj" --configuration Release

CMD ["dotnet", "test", "/src/Roblox.IntegrationTest/Roblox.IntegrationTest.csproj", "--no-build", "--configuration", "Release"]
