// Kandi notifications list mapped to the existing Pekora Notifications v2 route.
// The upstream controller currently returns placeholder data; writes stay disconnected.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("notifications", {
    list: E("GET", { p: "/notifications/v2/stream-notifications/get-recent" })
  });
})();