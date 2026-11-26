// Kandi users methods connected only to verified Pekora routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("users", {
    badges: E("GET", { p: "/badges/v1/users/{userId}/badges" }),
    collectibles: E("GET", { p: "/inventory/v1/users/{userId}/assets/collectibles" }),
    creations: E("GET"),
    favorites: E("GET"),
    friends: E("GET", { p: "/friends/v1/users/{userId}/friends" }),
    get: E("GET", {
      p: "/users/v1/users/{userId}",
      adapt: function (r) {
        if (!r) return r;
        return Object.assign({}, r, { username: r.username || r.name });
      }
    }),
    groups: E("GET", { p: "/groups/v1/users/{userId}/groups/roles" }),
    inventory: E("GET", { p: "/inventory/v1/users/{userId}/assets/collectibles" }),
    search: E("POST", { p: "/users/v1/usernames/users" }),
    usernameHistory: E("GET", { p: "/users/v1/users/{userId}/username-history" })
  });
})();