<div class="container d-flex align-items-center justify-content-center" style="min-height: calc(100vh - 180px);">
    <div class="row w-100">
        <div class="col-12 col-md-8 col-lg-5 mx-auto">
            <div class="card shadow-lg border-0">
                <div class="card-body p-5">
                    <div class="text-center mb-4">
                        <i class="bi bi-person-circle text-primary" style="font-size: 4rem;"></i>
                        <h3 class="mt-3 mb-2">Área Administrativa</h3>
                        <p class="text-muted">Faça login para continuar</p>
                    </div>

                    <form method="POST" action="<?php echo $GLOBALS['home_url']; ?>login">
                        <div class="mb-3">
                            <label for="login" class="form-label">Login / E-mail / CPF</label>
                            <input type="text" class="form-control form-control-lg" id="login" name="login" required autofocus>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label">Senha</label>
                            <input type="password" class="form-control form-control-lg" id="password" name="password" required>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-lg">Entrar</button>
                        </div>
                    </form>

                    <?php if (isset($_SESSION["messages_app"]["danger"])): ?>
                        <div class="alert alert-danger mt-3 mb-0" role="alert">
                            <?php
                            echo implode('<br>', $_SESSION["messages_app"]["danger"]);
                            unset($_SESSION["messages_app"]["danger"]);
                            ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>
