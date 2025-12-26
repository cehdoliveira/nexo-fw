/**
 * Actions Controller - Alpine.js
 * Controla as ações rápidas do dashboard
 */

document.addEventListener("alpine:init", () => {
  Alpine.data("actionsController", () => ({
    selectedAction: "",

    selectAction(action) {
      this.selectedAction = action;

      // Feedback visual
      setTimeout(() => {
        this.selectedAction = "";
      }, 3000);
    },

    async createUser() {
      const { value: formValues } = await Swal.fire({
        title: "Novo Usuário",
        html:
          '<input id="swal-input1" class="swal2-input" placeholder="Nome">' +
          '<input id="swal-input2" class="swal2-input" placeholder="Email">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Criar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          return [
            document.getElementById("swal-input1").value,
            document.getElementById("swal-input2").value,
          ];
        },
      });

      if (formValues) {
        Toast.fire({
          icon: "success",
          title: "Usuário criado com sucesso!",
        });
      }
    },
  }));
});
