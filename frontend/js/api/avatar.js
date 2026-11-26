// Kandi avatar methods mapped to verified Pekora Avatar v1 endpoints.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("avatar", {
    createOutfit: E("POST", { p: "/avatar/v1/outfits/create" }),
    deleteOutfit: E("POST", { p: "/avatar/v1/outfits/{outfitId}/delete" }),
    get: E("GET", { p: "/avatar/v1/users/{userId}/avatar" }),
    getBody: E("GET"),
    items: E("GET", { p: "/avatar/v1/recent-items/{recentType}/list" }),
    outfits: E("GET", { p: "/avatar/v1/users/{userId}/outfits" }),
    redraw: E("POST", { p: "/avatar/v1/avatar/redraw-thumbnail" }),
    remove: E("POST", { p: "/avatar/v1/avatar/assets/{assetId}/remove" }),
    renameOutfit: E("POST", { p: "/avatar/v1/outfits/{outfitId}/rename" }),
    setBodyColors: E("POST", { p: "/avatar/v1/avatar/set-body-colors" }),
    setScales: E("POST", { p: "/avatar/v1/avatar/set-scales" }),
    setType: E("POST", { p: "/avatar/v1/avatar/set-player-avatar-type" }),
    updateOutfit: E("PATCH", { p: "/avatar/v1/outfits/{outfitId}" }),
    wear: E("POST", { p: "/avatar/v1/avatar/assets/{assetId}/wear" }),
    wearOutfit: E("POST", { p: "/avatar/v1/outfits/{outfitId}/wear" })
  });
})();