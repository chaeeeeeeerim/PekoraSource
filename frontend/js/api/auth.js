// API "auth" - STATUS: NÃO CONECTADA. Preencha p (caminho), svc (serviço), m (método) e adapt depois de ler o controller do backend.
// E(método) cria { m, p: "", svc: "default", auth: true, csrf: true, adapt: null }.
//  - p: caminho, com {id}/{rowId}/... vindos de params. Vazio = a UI mostra "Not connected yet" (nunca falha em silêncio).
//  - adapt(resposta, opções): converte a resposta do backend para o formato que a UI espera (ver PEKORA_BACKEND_INTEGRATION.md).
//  - o método (m) abaixo é um palpite inicial: confirme no backend.
(function () {
  var E = KandiAPI.E;
  KandiAPI.define("auth", {
  discordStatus: E("GET"),
  applicationCode: E("GET"),
  applicationStatus: E("GET"),
  applyAccount: E("POST"),
  forgotPassword: E("POST"),
  login: E("POST", { p: "/auth/login" }),
  logout: E("POST", { p: "/auth/logout" }),
  me: E("GET", { p: "/auth/me" }),
  resetPassword: E("POST"),
  signup: E("POST", { p: "/auth/signup" }),
  twoFactorDisable: E("POST"),
  twoFactorEnable: E("POST"),
  twoFactorStatus: E("GET"),
  twoFactorVerify: E("POST"),
  verifyAccount: E("POST")
  });
})();
