// Inventory endpoints currently verified by the Pekora backend expose collectible assets.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("inventory", {
    collectibles: E("GET", { p: "/inventory/v1/users/{userId}/assets/collectibles" }),
    list: E("GET", { p: "/inventory/v1/users/{userId}/assets/collectibles" })
  });
})();