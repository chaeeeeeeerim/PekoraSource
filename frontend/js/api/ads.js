// Advertising methods mapped to the existing Pekora Ads v1 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("ads", {
    create: E("POST", { p: "/ads/v1/user-ads/asset/create" }),
    serve: E("GET", { p: "/ads/v1/sponsored-pages" }),
    mine: E("GET", { p: "/ads/v1/user-ads/{creatorType}/{creatorId}" }),
    sponsorships: E("GET", { p: "/ads/v1/sponsored-pages" })
  });
})();