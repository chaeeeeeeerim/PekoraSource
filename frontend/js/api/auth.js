// Kandi auth bridge: uses the existing Pekora session cookie. Login/application stay on Pekora's
// Razor routes so captcha, rate limits, 2FA, approvals and session creation are not bypassed.
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
    me: E("GET", {
      p: "/v1/me",
      adapt: function (r) {
        var user = r && r.user ? r.user : r;
        if (!user || user.id == null || !user.username) return user;
        return { id: user.id, username: user.username, displayName: user.displayName || user.username, currency: user.currency, tickets: user.tickets };
      }
    }),
    resetPassword: E("POST"),
    signup: E("POST", { p: "/v1/signup" }),
    twoFactorDisable: E("POST"),
    twoFactorEnable: E("POST"),
    twoFactorStatus: E("GET"),
    twoFactorVerify: E("POST"),
    verifyAccount: E("POST")
  });
})();
