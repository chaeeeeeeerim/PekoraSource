// Kandi trade methods mapped to the verified Pekora Trades v1 routes.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("trades", {
    accept: E("POST", { p: "/trades/v1/trades/{tradeId}/accept" }),
    counter: E("POST", { p: "/trades/v1/trades/{tradeId}/counter" }),
    create: E("POST", { p: "/trades/v1/trades/send" }),
    decline: E("POST", { p: "/trades/v1/trades/{tradeId}/decline" }),
    get: E("GET", { p: "/trades/v1/trades/{tradeId}" }),
    list: E("GET", { p: "/trades/v1/trades/{tradeType}" })
  });
})();