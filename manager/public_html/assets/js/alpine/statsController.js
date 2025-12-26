/**
 * Stats Controller - Alpine.js
 * Controla as estatísticas do dashboard
 */

document.addEventListener("alpine:init", () => {
  Alpine.data("statsController", () => ({
    stats: {
      users: 1234,
      content: 567,
      visits: 45678,
      revenue: 12345.67,
    },

    init() {
      // Simulação de atualização de dados
      this.loadStats();
    },

    async loadStats() {
      // Aqui você pode fazer uma chamada AJAX para buscar dados reais
      // const response = await fetch('/api/stats');
      // this.stats = await response.json();
    },

    formatCurrency(value) {
      return (
        "R$ " +
        value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    },

    formatNumber(value) {
      return value.toLocaleString("pt-BR");
    },
  }));
});
