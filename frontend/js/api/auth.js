// Kandi authentication endpoints verified against Roblox.Website/Controllers/RobloxApi/Login.cs.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("auth", {
    discordStatus: E("GET"),
    applicationCode: E("GET"),
    applicationStatus: E("GET"),
    applyAccount: E("POST"),
    forgotPassword: E("POST"),
    login: E("POST", { p: "/v1/login" }),
    logout: E("POST", { p: "/v1/logout" }),
    me: E("GET", { p: "/v1/me" }),
    resetPassword: E("POST"),
    signup: E("POST", { p: "/v1/signup" }),
    twoFactorDisable: E("POST"),
    twoFactorEnable: E("POST"),
    twoFactorStatus: E("GET"),
    twoFactorVerify: E("POST"),
    verifyAccount: E("POST")
  });
})();
