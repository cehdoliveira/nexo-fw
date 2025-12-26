/**
 * Users Controller - Alpine.js
 * Controla a tabela de usuários
 */

document.addEventListener("alpine:init", () => {
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
      // Inicialização
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
