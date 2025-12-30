/**
 * Controllers Bundle - Alpine.js
 * Unifica os controllers do manager em um único arquivo para simplificar carregamento.
 */

document.addEventListener("alpine:init", () => {
  // Stats Controller
  Alpine.data("statsController", () => ({
    stats: {
      users: 1234,
      content: 567,
      visits: 45678,
      revenue: 12345.67,
    },

    init() {
      this.loadStats();
    },

    async loadStats() {
      // fetch real stats if needed
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

  // Actions Controller
  Alpine.data("actionsController", () => ({
    selectedAction: "",

    selectAction(action) {
      this.selectedAction = action;
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

  // Users Controller
  Alpine.data("usersController", () => ({
    users: [
      {
        id: 1,
        name: "João Silva",
        email: "joao@exemplo.com",
        role: "Admin",
        status: "Ativo",
      },
      {
        id: 2,
        name: "Maria Santos",
        email: "maria@exemplo.com",
        role: "Editor",
        status: "Ativo",
      },
      {
        id: 3,
        name: "Pedro Costa",
        email: "pedro@exemplo.com",
        role: "Usuário",
        status: "Inativo",
      },
      {
        id: 4,
        name: "Ana Oliveira",
        email: "ana@exemplo.com",
        role: "Editor",
        status: "Ativo",
      },
      {
        id: 5,
        name: "Carlos Ferreira",
        email: "carlos@exemplo.com",
        role: "Usuário",
        status: "Ativo",
      },
    ],
    selectedUser: null,
    search: "",

    init() {
      console.log("Users Controller inicializado");
    },

    get filteredUsers() {
      if (!this.search) return this.users;
      return this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(this.search.toLowerCase()) ||
          user.email.toLowerCase().includes(this.search.toLowerCase())
      );
    },

    selectUser(userId) {
      this.selectedUser = userId;
    },

    async viewUser(user) {
      this.selectedUser = user.id;
      await Swal.fire({
        title: user.name,
        html: `
                    <div class="text-start">
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Função:</strong> ${user.role}</p>
                        <p><strong>Status:</strong> ${user.status}</p>
                    </div>
                `,
        icon: "info",
        confirmButtonText: "Fechar",
      });
    },

    async editUser(user) {
      await Swal.fire({
        icon: "info",
        title: "Editar Usuário",
        text: "Função de edição em desenvolvimento",
        confirmButtonText: "OK",
      });
    },

    async deleteUser(user) {
      const result = await Swal.fire({
        title: "Excluir usuário?",
        html: `Tem certeza que deseja excluir <strong>${user.name}</strong>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        this.users = this.users.filter((u) => u.id !== user.id);
        await Swal.fire(
          "Excluído!",
          "Usuário removido com sucesso.",
          "success"
        );
      }
    },

    getRoleBadgeClass(role) {
      const classes = {
        Admin: "bg-danger",
        Editor: "bg-primary",
        Usuário: "bg-secondary",
      };
      return classes[role] || "bg-secondary";
    },

    getStatusBadgeClass(status) {
      return status === "Ativo" ? "bg-success" : "bg-warning";
    },
  }));
});
