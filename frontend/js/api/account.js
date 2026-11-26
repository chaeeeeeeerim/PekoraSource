// Account settings mapped to existing Pekora AccountInformation, AccountSettings and Auth routes.
// Email changes, account deletion, social-link writes and session enumeration are not exposed here.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("account", {
    changeEmail: E("POST"),
    changePassword: E("POST", { p: "/auth/v2/user/passwords/change" }),
    changeUsername: E("POST", { p: "/auth/v1/username" }),
    delete: E("POST"),
    get: E("GET", { p: "/accountinformation/v1/metadata" }),
    getPrivacy: E("GET", { p: "/accountsettings/v1/inventory-privacy" }),
    getSocial: E("GET", { p: "/accountinformation/v1/promotion-channels" }),
    logoutOthers: E("POST", { p: "/auth/v2/logoutfromallsessionsandreauthenticate" }),
    logoutSession: E("POST", { p: "/auth/v2/logout" }),
    sessions: E("GET"),
    updateDiscord: E("POST"),
    updatePersonal: E("POST", { p: "/accountinformation/v1/description" }),
    updatePrivacy: E("POST", { p: "/accountsettings/v1/inventory-privacy" }),
    updateSocial: E("POST", { p: "/accountinformation/v1/promotion-channels" }),
    year: E("GET")
  });
})();