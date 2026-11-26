// User badge listing uses the existing Pekora Badges v1 route.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("badges", {
    mine: E("GET", { p: "/badges/v1/users/{userId}/badges" })
  });
})();