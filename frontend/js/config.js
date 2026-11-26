// Project Kandi - configuração central. É o único arquivo que você precisa editar para ligar o backend.
// Configuração de produção inicial: mesma origem do Pekora. Recursos sem rota verificada continuam explicitamente desconectados.
window.KANDI_CONFIG = {
  TEST_MODE: false,         // true = MODO TESTE: nada é real, tudo é simulação local (dados "Teste", ações simuladas, sem rede). false = usa a API abaixo (backend real).
  USE_STUB: false,         // só com DEMO:false. true = usa a API de teste local do server.py (--mock-api) para os métodos legados. NUNCA é o PekoraSource.
  API_BASE: "/apisite",        // Prefixo confirmado dos controllers ASP.NET do Pekora.
  SERVICES: { default: "" },   // URL base por serviço (vazio = usa API_BASE). Ex.: { default: "https://api.seudominio.com", avatar: "https://avatar.seudominio.com" }. Preencher após ler o Program.cs do backend.
  CSRF: { header: "x-csrf-token", retryStatus: 403 },   // Confirmado em CsrfMiddleware.cs: cookie HttpOnly + header x-csrf-token no desafio 403.
  // Sessão Pekora: cookie HttpOnly .PEKOSECURITY na mesma origem; o navegador o envia automaticamente.
  AUTH_MODE: "cookie",
  TOKEN_KEY: "kandi_token",
  // API base e CSRF foram confirmados no código; autenticação JSON ainda não existe no Pekora.
  CONFIRMED: { api: true, auth: false, csrf: true },
  TIMEOUT_MS: 10000,
  UPLOAD_TIMEOUT_MS: 120000,   // uploads (FormData) podem demorar mais
  PAGE_SIZE: 24,
  APP_URL: "app.html",         // usado pela tela de login para abrir o site logado
  LANDING_URL: "index.html",   // tela de login/cadastro (para onde o Log Out e o 401 voltam)
  DISCORD_INVITE: "#",         // link do convite do servidor Discord (rodapé). "#" = ainda não configurado (o link aparece desativado)
  DISCORD_URL: "/auth/discord",   // Fluxo Discord original do Pekora; OAuth e segredos permanecem no servidor.
  REQUIRE_DISCORD: true,       // exige verificação do Discord no cadastro (modo real). A decisão final é SEMPRE do servidor.
  BANNER: "Found a bug on Project Kandi? Then click on this message to report it and get rewards!",
  BUG_URL: "#",                // "#" = ainda não configurado (o banner aparece sem link)
  DOWNLOADS: { main: "#", windows: "#", studio: "#", ios: "#", android: "#", mac: "#", linux: "#" },   // "#" = ainda não configurado (botão desativado)
  ASSETS: { k: "assets/k.png", logo: "assets/logo.png", robux: "assets/robux.png", robuxw: "assets/robux-w.png", tixw: "assets/tix-w.png" },
  // Contrato da API de teste local (server.py --mock-api). Só é usado com USE_STUB:true; o PekoraSource não usa isto.
  ENDPOINTS: {
    login: "/auth/login", signup: "/auth/signup", logout: "/auth/logout", me: "/me",
    home: "/home", catalog: "/catalog/items", feedPost: "/feed", groups: "/groups",
    transactions: "/transactions", avatar: "/avatar/items", buildersClub: "/builders-club"
  }
};
window.KANDI_CONFIG.DEMO = window.KANDI_CONFIG.TEST_MODE;   // alias legado: o código antigo ainda lê DEMO. Mude só TEST_MODE.
