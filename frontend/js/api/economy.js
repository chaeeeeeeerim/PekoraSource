// Kandi economy read operations mapped to verified Pekora Economy v1 routes.
// Legacy Robux/Tix exchanges and transaction history remain disconnected until real handlers exist.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("economy", {
    balance: E("GET", { p: "/economy/v1/users/{userId}/currency" }),
    cancelListing: E("PATCH", { p: "/economy/v1/assets/{assetId}/resellable-copies/{userAssetId}" }),
    exchangeRobux: E("POST"),
    exchangeTix: E("POST"),
    groupFunds: E("GET", { p: "/economy/v1/groups/{groupId}/currency" }),
    resellerListings: E("GET", { p: "/economy/v1/assets/{assetId}/resellers" }),
    transactions: E("GET")
  });
})();