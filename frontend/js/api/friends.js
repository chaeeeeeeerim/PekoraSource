// Kandi friends methods mapped to the verified Pekora Friends v1 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("friends", {
    accept: E("POST", { p: "/friends/v1/users/{userIdToAccept}/accept-friend-request" }),
    decline: E("POST", { p: "/friends/v1/users/{userIdToDecline}/decline-friend-request" }),
    follow: E("POST", { p: "/friends/v1/users/{userIdToFollow}/follow" }),
    list: E("GET", { p: "/friends/v1/users/{userId}/friends" }),
    remove: E("POST", { p: "/friends/v1/users/{userIdToRemove}/unfriend" }),
    request: E("POST", { p: "/friends/v1/users/{userIdToRequest}/request-friendship" })
  });
})();