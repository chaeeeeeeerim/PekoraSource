// Kandi private-message methods mapped to the verified Pekora PrivateMessages v1 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("messages", {
    archive: E("POST", { p: "/privatemessages/v1/messages/archive" }),
    get: E("GET", { p: "/privatemessages/v1/messages/{messageId}" }),
    list: E("GET", { p: "/privatemessages/v1/messages" }),
    markUnread: E("POST", { p: "/privatemessages/v1/messages/mark-unread" }),
    send: E("POST", { p: "/privatemessages/v1/messages/send" }),
    unarchive: E("POST", { p: "/privatemessages/v1/messages/unarchive" }),
    unreadCount: E("GET", { p: "/privatemessages/v1/messages/unread/count" })
  });
})();