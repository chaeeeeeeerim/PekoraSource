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
    login: E("POST"),
    logout: E("POST", { p: "/auth/v2/logout" }),
    me: E("GET", {
      p: "/users/v1/users/authenticated",
      adapt: function (r) {
        if (!r || r.id == null || !r.name) return r;
        return { id: r.id, username: r.name, displayName: r.displayName || r.name, isStaff: r.isStaff };
      }
    }),
    resetPassword: E("POST"),
    signup: E("POST"),
    twoFactorDisable: E("POST"),
    twoFactorEnable: E("POST"),
    twoFactorStatus: E("GET"),
    twoFactorVerify: E("POST"),
    verifyAccount: E("POST")
  });
})();
