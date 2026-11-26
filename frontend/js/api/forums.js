// Forum operations mapped to verified Pekora Forums v1 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("forums", {
    categories: E("GET"),
    category: E("GET", { p: "/forums/v1/sub-category/{subCategoryId}/info" }),
    createThread: E("POST", { p: "/forums/v1/sub-category/{subCategoryId}/thread" }),
    mine: E("GET", { p: "/forums/v1/users/{userId}/posts" }),
    replies: E("GET", { p: "/forums/v1/threads/{threadId}/replies" }),
    reply: E("POST", { p: "/forums/v1/posts/{postId}/reply" }),
    thread: E("GET", { p: "/forums/v1/threads/{threadId}/info" }),
    threads: E("GET", { p: "/forums/v1/sub-category/{subCategoryId}/posts" })
  });
})();