// Membership reads use the existing Pekora PremiumFeatures v1 endpoints.
// Purchase is not connected: the backend exposes no confirmed purchase route.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("membership", {
    get: E("GET", { p: "/premiumfeatures/v1/users/{userId}/subscriptions" }),
    purchase: E("POST"),
    tiers: E("GET", { p: "/premiumfeatures/v1/products" })
  });
})();