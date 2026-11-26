// Library item search/details/acquisition reuse the verified Catalog and Economy routes.
// Comments and favorites listing require additional route/DTO work.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("library", {
    acquire: E("POST", { p: "/economy/v1/purchases/products/{assetId}" }),
    comments: E("GET"),
    favorite: E("POST", { p: "/catalog/v1/favorites/users/{userId}/assets/{assetId}/favorite" }),
    get: E("POST", { p: "/catalog/v1/catalog/items/details" }),
    postComment: E("POST"),
    search: E("GET", { p: "/catalog/v1/search/items" })
  });
})();