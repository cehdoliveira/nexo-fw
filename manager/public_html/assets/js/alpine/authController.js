/**
 * Auth Controller - Alpine.js
 * Controla autenticação e logout
 */

document.addEventListener("alpine:init", () => {
  Alpine.data("authController", () => ({
    async logout() {
      const result = await Swal.fire({
        title: "Sair do sistema?",
        text: "Você será desconectado",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, sair",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        window.location.href = "?logout=yes";
      }
    },
  }));
});
