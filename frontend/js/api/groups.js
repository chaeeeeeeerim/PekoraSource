// Kandi group methods mapped to confirmed Pekora Groups v1 endpoints.
// Features without a matching backend route remain intentionally disconnected.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("groups", {
    mine: E("GET", { p: "/groups/v1/users/{userId}/groups/roles" }),
    auditLog: E("GET", { p: "/groups/v1/groups/{groupId}/audit-log" }),
    changeOwner: E("POST", { p: "/groups/v1/groups/{groupId}/change-owner" }),
    create: E("POST", { p: "/groups/v1/groups/create" }),
    createRole: E("POST", { p: "/groups/v1/groups/{groupId}/rolesets/create" }),
    deleteRole: E("DELETE", { p: "/groups/v1/groups/{groupId}/rolesets/{roleSetId}" }),
    editRole: E("PATCH", { p: "/groups/v1/groups/{groupId}/rolesets/{roleSetId}" }),
    games: E("GET"),
    get: E("GET", { p: "/groups/v1/groups/{groupId}" }),
    join: E("POST", { p: "/groups/v1/groups/{groupId}/users" }),
    leave: E("DELETE", { p: "/groups/v1/groups/{groupId}/users/{userId}" }),
    members: E("GET", { p: "/groups/v1/groups/{groupId}/users" }),
    payout: E("POST", { p: "/groups/v1/groups/{groupId}/payouts" }),
    postWall: E("POST", { p: "/groups/v1/groups/{groupId}/wall/posts" }),
    removeMember: E("DELETE", { p: "/groups/v1/groups/{groupId}/users/{userId}" }),
    roles: E("GET", { p: "/groups/v1/groups/{groupId}/roles" }),
    search: E("GET", { p: "/groups/v1/groups/search" }),
    setMemberRole: E("PATCH", { p: "/groups/v1/groups/{groupId}/users/{userId}" }),
    setPrimary: E("POST", { p: "/groups/v1/user/groups/primary" }),
    updateIcon: E("PATCH", { p: "/groups/v1/groups/icon" }),
    updateSettings: E("PATCH", { p: "/groups/v1/groups/{groupId}/settings" }),
    wall: E("GET")
  });
})();