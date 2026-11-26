// Verified same-origin adapters for the Pekora ASP.NET API.
// Only routes present in Roblox/Roblox.Website/Controllers/v1 are enabled here.
(function () {
  "use strict";
  var A = window.KandiAPI, E = A.E, currentUserId = null, activeTradePartnerId = null, cursors = Object.create(null);

  function selfParams(p) { return { userId: p.userId != null ? p.userId : (p.id != null ? p.id : currentUserId) }; }
  function idParams(p) { return { userId: p.userId != null ? p.userId : p.id }; }
  function groupParams(p) { return { groupId: p.groupId != null ? p.groupId : p.id }; }
  function tradeParams(p) { return { tradeId: p.tradeId != null ? p.tradeId : p.id }; }
  function assetParams(p) { return { assetId: p.assetId != null ? p.assetId : (p.rowId != null ? p.rowId : p.id) }; }
  function outfitParams(p) { return { outfitId: p.outfitId != null ? p.outfitId : (p.rowId != null ? p.rowId : p.id) }; }
  function arr(r, keys) {
    if (Array.isArray(r)) return r;
    for (var i = 0; i < keys.length; i++) if (r && Array.isArray(r[keys[i]])) return r[keys[i]];
    return [];
  }
  function item(x) {
    x = x || {};
    var creator = x.creator || x.seller || {};
    return {
      id: x.id != null ? x.id : (x.assetId != null ? x.assetId : x.universeId),
      name: x.name || x.title || "",
      creator: creator.name || creator.username || x.creatorName || "",
      thumbnail: x.thumbnail || x.imageUrl || x.thumbnailUrl || x.iconImageAssetId && ("/Thumbs/Asset.ashx?assetId=" + x.iconImageAssetId) || "",
      price: x.price != null ? x.price : (x.priceInRobux != null ? x.priceInRobux : undefined),
      value: x.recentAveragePrice != null ? x.recentAveragePrice : undefined,
      sales: x.sales != null ? x.sales : undefined,
      isNew: x.isNew != null ? x.isNew : undefined,
      worn: x.worn != null ? x.worn : undefined,
      url: x.url || ""
    };
  }
  function row(x) {
    x = x || {};
    var owner = x.owner || x.user || x.poster || x.creator || {};
    return {
      id: x.id != null ? x.id : (x.userId != null ? x.userId : (x.groupId != null ? x.groupId : x.roleId)),
      title: x.title || x.name || x.username || owner.name || owner.username || "",
      subtitle: x.subtitle || x.description || "",
      meta: x.meta || (x.memberCount != null ? (x.memberCount + " Members") : (x.rank != null ? ("Rank " + x.rank) : "")),
      thumbnail: x.thumbnail || x.imageUrl || x.icon || "",
      href: x.href || ""
    };
  }
  function tradeItem(x) { var y = item(x); y.id = x && (x.userAssetId != null ? x.userAssetId : y.id); return y; }
  function game(x) {
    x = x || {};
    return {
      id: x.id != null ? x.id : (x.universeId != null ? x.universeId : x.rootPlaceId),
      name: x.name || x.title || "",
      thumbnail: x.thumbnail || x.imageUrl || x.iconImageUrl || x.thumbnailUrl || "",
      playing: x.playing != null ? x.playing : (x.playerCount != null ? x.playerCount : undefined),
      likeRatio: x.likeRatio != null ? x.likeRatio : undefined,
      url: x.url || ""
    };
  }
  function page(name, path, method, cfg) {
    cfg = cfg || {};
    return E(method || "GET", {
      p: path,
      params: cfg.params,
      prepare: function (o) {
        var original = Object.assign({}, o.query || {}), pageNo = Math.max(1, +original.page || 1);
        delete original.page;
        var q = cfg.query ? cfg.query(original, o, pageNo) : original;
        q = Object.assign({}, q || {});
        var keyQuery = Object.assign({}, q); delete keyQuery.cursor;
        var key = name + "|" + JSON.stringify(keyQuery);
        if (pageNo > 1 && cursors[key] && cursors[key][pageNo]) q.cursor = cursors[key][pageNo];
        var body = cfg.body ? cfg.body(o) : o.body;
        return { query: q, body: body };
      },
      adapt: function (r, o) {
        var original = Object.assign({}, o.query || {}), pageNo = Math.max(1, +original.page || 1);
        delete original.page;
        var q = cfg.query ? cfg.query(original, o, pageNo) : original;
        q = Object.assign({}, q || {});
        var keyQuery = Object.assign({}, q); delete keyQuery.cursor;
        var key = name + "|" + JSON.stringify(keyQuery);
        var values = cfg.items ? cfg.items(r) : arr(r, ["data", "items", "games", "groups", "roles", "collection", "results"]);
        var next = r && (r.nextPageCursor || r.nextCursor || r.nextPageToken);
        if (next) { cursors[key] = cursors[key] || Object.create(null); cursors[key][pageNo + 1] = next; }
        var limit = +(original.limit || original.pageSize || 24);
        var mapped = values.map(cfg.map || row);
        return {
          items: mapped,
          hasMore: cfg.noMore ? false : (!!next || (values.length >= limit && values.length > 0)),
          total: r && (typeof r.total === "number" ? r.total : (typeof r.totalCount === "number" ? r.totalCount : undefined))
        };
      }
    });
  }
  function simple(path, method, cfg) {
    cfg = cfg || {};
    return E(method || "GET", {
      p: path,
      params: cfg.params,
      prepare: cfg.prepare,
      adapt: cfg.adapt
    });
  }
  function currentUser(r) {
    if (r && r.id != null) currentUserId = r.id;
    return r;
  }

  // Session is still Pekora's HttpOnly cookie. This only remembers the returned numeric ID in memory.
  A.define("auth", {
    me: simple("/users/v1/users/authenticated", "GET", {
      adapt: function (r) {
        r = currentUser(r || {});
        return { id: r.id, username: r.name || r.username, displayName: r.displayName || r.name || r.username, isStaff: !!r.isStaff };
      }
    })
  });

  A.define("users", {
    get: simple("/users/v1/users/{userId}", "GET", {
      params: idParams,
      adapt: function (r) {
        return { id: r.id, username: r.name || r.username, title: r.name || r.username, description: r.description || "", stats: [
          ["Friends", r.friendshipCount], ["Followers", r.followerCount], ["Following", r.followingCount], ["Inventory RAP", r.inventory_rap != null ? r.inventory_rap : r.inventoryRap]
        ].filter(function (x) { return x[1] != null; }) };
      }
    }),
    search: page("users.search", "/users/v1/usernames/users", "POST", {
      body: function (o) { var q = o.query || {}; return { usernames: [String(q.q || "").trim()] }; },
      noMore: true, items: function (r) { return arr(r, ["data"]); }, map: row
    }),
    usernameHistory: page("users.usernameHistory", "/users/v1/users/{userId}/username-history", "GET", {
      params: idParams, query: function (q) { return { limit: q.limit || 20, cursor: q.cursor }; },
      map: function (x) { return row({ id: x.username, name: x.username, meta: x.created || "" }); }
    }),
    friends: page("users.friends", "/friends/v1/users/{userId}/friends", "GET", { params: idParams, noMore: true, map: row }),
    groups: page("users.groups", "/groups/v1/users/{userId}/groups/roles", "GET", {
      params: idParams, noMore: true, items: function (r) { return arr(r, ["data"]); },
      map: function (x) { return row(Object.assign({}, x.group || {}, { meta: x.role && x.role.name ? x.role.name : "" })); }
    }),
    badges: page("users.badges", "/badges/v1/users/{userId}/badges", "GET", { params: idParams, noMore: true, map: row }),
    inventory: page("users.inventory", "/inventory/v1/users/{userId}/assets/collectibles", "GET", { params: idParams, map: item }),
    collectibles: page("users.collectibles", "/inventory/v1/users/{userId}/assets/collectibles", "GET", { params: idParams, map: tradeItem })
  });

  A.define("friends", {
    list: page("friends.list", "/friends/v1/users/{userId}/friends", "GET", { params: selfParams, noMore: true, map: row }),
    request: simple("/friends/v1/users/{userIdToRequest}/request-friendship", "POST", { params: function (p) { return { userIdToRequest: p.userIdToRequest || p.userId || p.id }; } }),
    accept: simple("/friends/v1/users/{userIdToAccept}/accept-friend-request", "POST", { params: function (p) { return { userIdToAccept: p.userIdToAccept || p.userId || p.id || p.rowId }; } }),
    decline: simple("/friends/v1/users/{userIdToDecline}/decline-friend-request", "POST", { params: function (p) { return { userIdToDecline: p.userIdToDecline || p.userId || p.id || p.rowId }; } }),
    remove: simple("/friends/v1/users/{userIdToRemove}/unfriend", "POST", { params: function (p) { return { userIdToRemove: p.userIdToRemove || p.userId || p.id || p.rowId }; } }),
    follow: simple("/friends/v1/users/{userIdToFollow}/follow", "POST", { params: function (p) { return { userIdToFollow: p.userIdToFollow || p.userId || p.id || p.rowId }; } })
  });

  A.define("games", {
    search: page("games.search", "/games/v1/games/list", "GET", {
      query: function (q) { return { sortToken: q.sortToken || q.sort || "popular", maxRows: q.limit || 24, keyword: q.q || q.keyword || undefined }; }, noMore: true,
      items: function (r) { return arr(r, ["games"]); }, map: game
    }),
    get: simple("/games/v1/games", "GET", {
      prepare: function (o) { return { query: { universeIds: o.params && (o.params.id || o.params.universeId) } }; },
      adapt: function (r) {
        var x = arr(r, ["data"])[0] || r || {};
        return { title: x.name || x.title || "", name: x.name || x.title || "", description: x.description || "", thumbnail: x.thumbnail || x.imageUrl || "", stats: [
          ["Playing", x.playing], ["Visits", x.visits], ["Favorites", x.favoritedCount]
        ].filter(function (v) { return v[1] != null; }) };
      }
    }),
    recommendations: page("games.recommendations", "/games/v1/games/recommendations/game/{universeId}", "GET", {
      params: function (p) { return { universeId: p.universeId || p.id }; },
      query: function (q) { return { maxRows: q.limit || 12 }; },
      items: function (r) { return arr(r, ["games"]); }, map: game
    }),
    badges: page("games.badges", "/badges/v1/universes/{universeId}/badges", "GET", {
      params: function (p) { return { universeId: p.universeId || p.id }; }, noMore: true, map: row
    }),
    thumbnails: page("games.thumbnails", "/thumbnails/v1/games/icons", "GET", {
      query: function (q, o) { return { universeIds: (o.params && (o.params.id || o.params.universeId)) || q.universeIds || "" }; },
      items: function (r) { return arr(r, ["data"]); }, map: function (x) { return row({ id: x.targetId, name: "Game thumbnail", thumbnail: x.imageUrl }); }
    }),
    vote: simple("/games/v1/games/{universeId}/user-votes", "PATCH", { params: function (p) { return { universeId: p.universeId || p.id }; } })
  });

  A.define("catalog", {
    search: page("catalog.search", "/catalog/v1/search/items", "GET", {
      query: function (q) { return { keyword: q.q || q.keyword || undefined, category: q.category || undefined, subcategory: q.subcategory || undefined, sortType: q.sortType || q.sort || undefined, limit: q.limit || 24, cursor: q.cursor }; },
      items: function (r) { return arr(r, ["data", "items"]); }, map: item
    }),
    get: simple("/catalog/v1/catalog/items/details", "POST", {
      prepare: function (o) { return { body: { items: [{ id: (o.params && (o.params.id || o.params.assetId)) }] } }; },
      adapt: function (r) {
        var x = arr(r, ["data"])[0] || {};
        return { title: x.name || "", name: x.name || "", description: x.description || "", thumbnail: x.thumbnail || x.imageUrl || "", stats: [
          ["Price", x.price], ["Creator", x.creator && (x.creator.name || x.creator.username)]
        ].filter(function (v) { return v[1] != null; }), creatorHref: x.creator && x.creator.id ? ("#user/" + x.creator.id) : "" };
      }
    }),
    resellers: page("catalog.resellers", "/economy/v1/assets/{assetId}/resellers", "GET", { params: assetParams, map: row }),
    favorite: simple("/catalog/v1/favorites/users/{userId}/assets/{assetId}/favorite", "POST", {
      params: function (p) { return { userId: currentUserId, assetId: p.assetId || p.id }; }
    })
  });

  A.define("inventory", {
    list: page("inventory.list", "/inventory/v1/users/{userId}/assets/collectibles", "GET", {
      params: selfParams, query: function (q) { return { limit: q.limit || 24, cursor: q.cursor, sortOrder: "desc" }; }, map: item
    }),
    collectibles: page("inventory.collectibles", "/inventory/v1/users/{userId}/assets/collectibles", "GET", {
      params: selfParams, query: function (q) { return { limit: q.limit || 24, cursor: q.cursor, sortOrder: "desc" }; }, map: tradeItem
    })
  });

  A.define("avatar", {
    get: simple("/avatar/v1/avatar", "GET"),
    getBody: simple("/avatar/v1/avatar", "GET"),
    items: page("avatar.items", "/avatar/v1/recent-items/{recentType}/list", "GET", {
      params: function (p, o) { var tab = (o.query && o.query.tab) || "Hats"; return { recentType: tab.charAt(0).toUpperCase() + tab.slice(1) }; },
      noMore: true, map: item
    }),
    outfits: page("avatar.outfits", "/avatar/v1/users/{userId}/outfits", "GET", {
      params: selfParams, query: function (q, o, pageNo) { return { itemsPerPage: q.limit || 20, page: pageNo }; },
      items: function (r) { return arr(r, ["data"]); }, map: row
    }),
    redraw: simple("/avatar/v1/avatar/redraw-thumbnail", "POST"),
    wear: simple("/avatar/v1/avatar/assets/{assetId}/wear", "POST", { params: assetParams }),
    remove: simple("/avatar/v1/avatar/assets/{assetId}/remove", "POST", { params: assetParams }),
    setType: simple("/avatar/v1/avatar/set-player-avatar-type", "POST"),
    setScales: simple("/avatar/v1/avatar/set-scales", "POST"),
    createOutfit: simple("/avatar/v1/outfits/create", "POST"),
    deleteOutfit: simple("/avatar/v1/outfits/{outfitId}/delete", "POST", { params: outfitParams }),
    renameOutfit: simple("/avatar/v1/outfits/{outfitId}/rename", "POST", { params: outfitParams }),
    updateOutfit: simple("/avatar/v1/outfits/{outfitId}", "PATCH", { params: outfitParams }),
    wearOutfit: simple("/avatar/v1/outfits/{outfitId}/wear", "POST", { params: outfitParams })
  });

  A.define("groups", {
    mine: page("groups.mine", "/groups/v1/users/{userId}/groups/roles", "GET", {
      params: selfParams, noMore: true, items: function (r) { return arr(r, ["data"]); },
      map: function (x) { return row(Object.assign({}, x.group || {}, { meta: x.role && x.role.name ? x.role.name : "" })); }
    }),
    search: page("groups.search", "/groups/v1/groups/search", "GET", {
      query: function (q) { return { keyword: q.q || q.keyword || "", limit: q.limit || 24, cursor: q.cursor }; }, map: row
    }),
    get: simple("/groups/v1/groups/{groupId}", "GET", {
      params: groupParams,
      adapt: function (x) { return { title: x.name || "", name: x.name || "", description: x.description || "", thumbnail: x.icon || x.thumbnail || "", stats: [["Members", x.memberCount]].filter(function (v) { return v[1] != null; }) }; }
    }),
    members: page("groups.members", "/groups/v1/groups/{groupId}/users", "GET", { params: groupParams, query: function (q) { return { limit: q.limit || 24, cursor: q.cursor, sortOrder: "asc" }; }, map: row }),
    roles: page("groups.roles", "/groups/v1/groups/{groupId}/roles", "GET", { params: groupParams, noMore: true, items: function (r) { return arr(r, ["roles"]); }, map: row }),
    auditLog: page("groups.auditLog", "/groups/v1/groups/{groupId}/audit-log", "GET", { params: groupParams, query: function (q) { return { limit: q.limit || 20, cursor: q.cursor }; }, map: row }),
    create: simple("/groups/v1/groups/create", "POST"),
    join: simple("/groups/v1/groups/{groupId}/users", "POST", { params: groupParams }),
    leave: simple("/groups/v1/groups/{groupId}/users/{userId}", "DELETE", { params: function (p) { return { groupId: p.groupId || p.id, userId: currentUserId }; } }),
    setPrimary: simple("/groups/v1/user/groups/primary", "POST", { prepare: function (o) { return { body: { groupId: (o.params && (o.params.groupId || o.params.id)) || (o.body && o.body.groupId) } }; } }),
    postWall: simple("/groups/v1/groups/{groupId}/wall/posts", "POST", {
      params: groupParams, prepare: function (o) { return { body: { body: o.body && (o.body.body || o.body.text) || "" } }; }
    }),
    updateSettings: simple("/groups/v1/groups/{groupId}/description", "PATCH", {
      params: groupParams, prepare: function (o) { return { body: { description: o.body && o.body.description || "" } }; }
    }),
    updateIcon: simple("/groups/v1/groups/icon", "PATCH", {
      prepare: function (o) { return { query: { groupId: (o.params && (o.params.groupId || o.params.id)) || currentUserId }, body: o.body }; }
    }),
    createRole: simple("/groups/v1/groups/{groupId}/rolesets/create", "POST", { params: groupParams }),
    editRole: simple("/groups/v1/groups/{groupId}/rolesets/{roleSetId}", "PATCH", { params: function (p) { return { groupId: p.groupId || p.id, roleSetId: p.roleSetId || p.rowId }; } }),
    deleteRole: simple("/groups/v1/groups/{groupId}/rolesets/{roleSetId}", "DELETE", { params: function (p) { return { groupId: p.groupId || p.id, roleSetId: p.roleSetId || p.rowId }; } }),
    removeMember: simple("/groups/v1/groups/{groupId}/users/{userId}", "DELETE", { params: function (p) { return { groupId: p.groupId || p.id, userId: p.userId || p.rowId }; } }),
    setMemberRole: simple("/groups/v1/groups/{groupId}/users/{userId}", "PATCH", { params: function (p) { return { groupId: p.groupId || p.id, userId: p.userId || p.rowId }; } }),
    changeOwner: simple("/groups/v1/groups/{groupId}/change-owner", "POST", { params: groupParams }),
    payout: simple("/groups/v1/groups/{groupId}/payouts", "POST", { params: groupParams, prepare: function (o) { var b=o.body||{}; return { body: { PayoutType: "FixedAmount", Recipients: [{ recipientType: "User", recipientId: +(b.userId||0), amount: +(b.amount||0) }] } }; } })
  });

  A.define("messages", {
    unreadCount: simple("/privatemessages/v1/messages/unread/count", "GET"),
    list: page("messages.list", "/privatemessages/v1/messages", "GET", {
      query: function (q, o, pageNo) { return { messageTab: q.type || q.messageTab || "Inbox", pageSize: q.limit || 20, pageNumber: pageNo - 1 }; },
      items: function (r) { return arr(r, ["collection", "data", "messages"]); }, map: row
    }),
    get: simple("/privatemessages/v1/messages/{messageId}", "GET", { params: function (p) { return { messageId: p.messageId || p.id }; }, adapt: function (x) { return row({ id: x.id, name: x.subject, subtitle: x.body, meta: x.sender && x.sender.name }); } }),
    send: simple("/privatemessages/v1/messages/send", "POST", { adapt: function (r) { if (r && r.success === false) throw new A.ApiError(400, r.message || "Message could not be sent.", null, "http"); return r; } }),
    markUnread: simple("/privatemessages/v1/messages/mark-unread", "POST", { prepare: function (o) { return { body: o.body || { messageIds: [+(o.params && (o.params.id || o.params.rowId))] } }; } }),
    archive: simple("/privatemessages/v1/messages/archive", "POST", { prepare: function (o) { return { body: o.body || { messageIds: [+(o.params && (o.params.id || o.params.rowId))] } }; } }),
    unarchive: simple("/privatemessages/v1/messages/unarchive", "POST", { prepare: function (o) { return { body: o.body || { messageIds: [+(o.params && (o.params.id || o.params.rowId))] } }; } })
  });

  A.define("trades", {
    list: page("trades.list", "/trades/v1/trades/{tradeType}", "GET", {
      params: function (p, o) { var t = (o.query && o.query.type) || "incoming"; return { tradeType: ({ incoming: "Inbound", outgoing: "Outbound", completed: "Completed", inactive: "Inactive" })[t] || t }; },
      query: function (q) { return { limit: q.limit || 20, cursor: q.cursor }; }, map: row
    }),
    get: simple("/trades/v1/trades/{tradeId}", "GET", {
      params: tradeParams,
      adapt: function (r) {
        var offers = r.offers || [], other = offers.filter(function (x) { return x.user && x.user.id !== currentUserId; })[0] || offers[1] || {};
        if (other.user && other.user.id != null) activeTradePartnerId = other.user.id;
        var mine = offers.filter(function (x) { return x.user && x.user.id === currentUserId; })[0] || offers[0] || {};
        return { partnerId: other.user && other.user.id, offerItems: (mine.userAssets || []).map(item), requestItems: (other.userAssets || []).map(item), offerRobux: mine.robux || 0, requestRobux: other.robux || 0, title: "Trade #" + r.id, name: "Trade #" + r.id, stats: [["Status", r.status || ""], ["Partner", other.user && other.user.name || ""]] };
      }
    }),
    create: simple("/trades/v1/trades/send", "POST", { prepare: function (o) { var b=o.body||{}, partner=+(o.params && o.params.userId || 0); return { body: { offers: [{ userId: currentUserId, userAssetIds: b.offerItems || [], robux: +(b.offerRobux||0) }, { userId: partner, userAssetIds: b.requestItems || [], robux: +(b.requestRobux||0) }] } }; } }),
    counter: simple("/trades/v1/trades/{tradeId}/counter", "POST", { params: tradeParams, prepare: function (o) { var b=o.body||{}, partner=+(o.params && o.params.partnerId || activeTradePartnerId || 0); return { body: { offers: [{ userId: currentUserId, userAssetIds: b.offerItems || [], robux: +(b.offerRobux||0) }, { userId: partner, userAssetIds: b.requestItems || [], robux: +(b.requestRobux||0) }] } }; } }),
    accept: simple("/trades/v1/trades/{tradeId}/accept", "POST", { params: tradeParams }),
    decline: simple("/trades/v1/trades/{tradeId}/decline", "POST", { params: tradeParams })
  });

  A.define("economy", {
    balance: simple("/economy/v1/users/{userId}/currency", "GET", {
      params: selfParams,
      adapt: function (r) { return { title: "My Money", name: "My Money", stats: [["Robux", r && r.robux], ["Tickets", r && r.tickets]].filter(function (x) { return x[1] != null; }), robux: r && r.robux, tickets: r && r.tickets }; }
    }),
    resellerListings: page("economy.resellerListings", "/economy/v1/assets/{assetId}/resellers", "GET", { params: assetParams, map: row })
  });

  A.define("thumbnails", {
    assets: page("thumbnails.assets", "/thumbnails/v1/assets", "GET", { query: function (q,o) { return { assetIds: (o.params && (o.params.id || o.params.assetId)) || q.assetIds || "" }; }, items: function (r) { return arr(r, ["data"]); }, map: function (x) { return row({ id: x.targetId, name: "Asset thumbnail", thumbnail: x.imageUrl }); } }),
    games: page("thumbnails.games", "/thumbnails/v1/games/icons", "GET", { query: function (q,o) { return { universeIds: (o.params && (o.params.id || o.params.universeId)) || q.universeIds || "" }; }, items: function (r) { return arr(r, ["data"]); }, map: function (x) { return row({ id: x.targetId, name: "Game thumbnail", thumbnail: x.imageUrl }); } }),
    users: page("thumbnails.users", "/thumbnails/v1/users/avatar-headshot", "GET", { query: function (q,o) { return { userIds: (o.params && (o.params.id || o.params.userId)) || q.userIds || "" }; }, items: function (r) { return arr(r, ["data"]); }, map: function (x) { return row({ id: x.targetId, name: "User thumbnail", thumbnail: x.imageUrl }); } })
  });

  A.define("badges", {
    mine: page("badges.mine", "/badges/v1/users/{userId}/badges", "GET", { params: selfParams, map: row })
  });

  A.define("membership", {
    get: simple("/premiumfeatures/v1/users/{userId}/subscriptions", "GET", { params: selfParams, adapt: function (r) { var m=r && r.subscriptionProductModel || {}; return { title: "Membership", name: "Membership", stats: [["Plan", m.subscriptionTypeName], ["Robux stipend", m.robuxStipendAmount], ["Expires", m.expiration]].filter(function (x) { return x[1] != null; }) }; } })
  });

  A.define("site", {
    announcements: simple("/privatemessages/v1/announcements", "GET", {
      adapt: function (r) { return { items: arr(r, ["collection", "data"]), total: r && r.totalCollectionSize || 0 }; }
    })
  });

  A.define("account", {
    get: simple("/accountinformation/v1/description", "GET", {
      adapt: function (r) { return { about: r && r.description || "", description: r && r.description || "" }; }
    }),
    changeUsername: simple("/auth/v1/username", "POST", { prepare: function (o) { var b=o.body||{}; return { body: { username: b.newUsername || b.username, password: b.password } }; } })
  });

  A.define("ads", {
    serve: simple("/ads/v1/sponsored-pages", "GET", { adapt: function (r) { return { items: arr(r, ["data"]) }; } }),
    mine: page("ads.mine", "/ads/v1/user-ads/User/{creatorId}", "GET", {
      params: function () { return { creatorId: currentUserId }; }, map: row
    })
  });

  A.define("library", {
    search: page("library.search", "/catalog/v1/search/items", "GET", {
      query: function (q) { return { keyword: q.q || q.keyword || undefined, category: q.category || undefined, limit: q.limit || 24, cursor: q.cursor }; },
      items: function (r) { return arr(r, ["data", "items"]); }, map: item
    }),
    get: simple("/catalog/v1/catalog/items/details", "POST", {
      prepare: function (o) { return { body: { items: [{ id: (o.params && (o.params.id || o.params.assetId)) }] } }; },
      adapt: function (r) { var x=arr(r, ["data"])[0]||{}; return { title:x.name||"", name:x.name||"", description:x.description||"", thumbnail:x.thumbnail||x.imageUrl||"" }; }
    }),
    favorite: simple("/catalog/v1/favorites/users/{userId}/assets/{assetId}/favorite", "POST", {
      params: function (p) { return { userId: currentUserId, assetId: p.assetId || p.id }; }
    })
  });

})();