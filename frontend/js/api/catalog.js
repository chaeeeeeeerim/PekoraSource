// Kandi catalog operations mapped to the confirmed Pekora Catalog/Economy routes.
// Comments, sales history, and legacy limited listings need dedicated backend handlers.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("catalog", {
    search: E("GET", { p: "/catalog/v1/search/items" }),
    buyReseller: E("POST"),
    comments: E("GET"),
    favorite: E("POST", { p: "/catalog/v1/favorites/users/{userId}/assets/{assetId}/favorite" }),
    get: E("POST", { p: "/catalog/v1/catalog/items/details" }),
    limiteds: E("GET", { p: "/catalog/v1/search/items" }),
    postComment: E("POST"),
    purchase: E("POST", { p: "/economy/v1/purchases/products/{assetId}" }),
    recommendations: E("GET", { p: "/catalog/v1/recommendations/asset/{assetTypeId}" }),
    resellers: E("GET", { p: "/economy/v1/assets/{assetId}/resellers" }),
    salesHistory: E("GET")
  });
})();