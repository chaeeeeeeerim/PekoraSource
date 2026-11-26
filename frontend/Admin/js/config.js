// Project Kandi Admin - configuração. SOMENTE FRONTEND / DEMONSTRAÇÃO VISUAL.
window.ADMIN_CONFIG = {
  // Senha da tela de demonstração. NÃO é autenticação: está visível no navegador e não protege nada.
  // TODO(backend): remover o portão de demo e usar a autenticação/permissões reais do KSbackend.
  DEMO_GATE_PASSWORD: null,
  GATE_KEY: "kandi_admin_demo_gate",   // sessionStorage; só lembra que a tela de demo foi passada
  // TODO(backend): o cargo vem da sessão real. Só estes cargos podem editar permissões de cargos.
  DEMO_ROLE: "Owner", HIGH_ROLES: ["Owner", "Admin"],
  // Só estes cargos podem publicar limiteds (membros comuns nunca). TODO(backend): a regra real TEM que ser validada no servidor.
  LIMITED_ROLES: ["Owner", "Admin"],
  TEST_MODE: false,   // true = ações do admin são SIMULADAS (nada é salvo). false = chama o backend (AdminData.perform).
  PAGE_SIZE: 6,
  LOGO: "../assets/k.png"
};
