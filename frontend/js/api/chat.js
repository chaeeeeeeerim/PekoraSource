// Kandi chat methods mapped to the verified Pekora Chat v2 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("chat", {
    conversations: E("GET", { p: "/chat/v2/get-user-conversations" }),
    messages: E("GET", { p: "/chat/v2/get-messages" }),
    send: E("POST", { p: "/chat/v2/send-message" })
  });
})();