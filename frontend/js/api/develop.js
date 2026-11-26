// Kandi creator methods mapped only where a matching Pekora Develop v1 route exists.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("develop", {
    badges: E("GET", { p: "/badges/v1/universes/{universeId}/badges" }),
    createBadge: E("POST"),
    createGame: E("POST"),
    createPass: E("POST"),
    createPlace: E("POST"),
    createProduct: E("POST", { p: "/develop/v1/universes/{universeId}/developerproducts" }),
    gameThumbnails: E("GET"),
    generateThumbnail: E("POST"),
    getAsset: E("GET", { p: "/develop/v1/assets/{assetId}/latest-saved-version" }),
    getBadge: E("GET", { p: "/badges/v1/badges/{badgeId}" }),
    getGame: E("GET"),
    getPass: E("GET"),
    getProduct: E("GET"),
    mine: E("GET", { p: "/develop/v1/assets" }),
    moderation: E("GET"),
    passes: E("GET"),
    products: E("GET", { p: "/develop/v1/universes/{universeId}/developerproducts" }),
    updateAsset: E("PATCH", { p: "/develop/v1/assets/{assetId}" }),
    updateBadge: E("PATCH", { p: "/badges/v1/badges/{badgeId}" }),
    updateGame: E("PATCH"),
    updatePass: E("PATCH"),
    updatePlace: E("POST"),
    updateProduct: E("POST", { p: "/develop/v1/universes/{universeId}/developerproducts/{productId}/update" }),
    uploadAsset: E("POST"),
    uploadGameIcon: E("POST", { p: "/develop/v1/assets/upload-gameicon" }),
    uploadGameThumbnail: E("POST", { p: "/develop/v1/assets/upload-thumbnail" }),
    uploadVersion: E("POST"),
    versions: E("GET", { p: "/develop/v1/assets/{assetId}/published-versions" })
  });
})();