// Kandi thumbnail lookups mapped to the verified Pekora Thumbnails v1 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("thumbnails", {
    assets: E("GET", { p: "/thumbnails/v1/assets" }),
    games: E("GET", { p: "/thumbnails/v1/games/icons" }),
    users: E("GET", { p: "/thumbnails/v1/users/avatar" })
  });
})();