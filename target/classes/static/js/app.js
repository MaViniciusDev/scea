// app.js
// Fluxo de login em 2 etapas e cadastro, com tratamento de token expirado via toast

// Estado global
let currentEmail     = '';
let currentFirstName = '';
let currentLastName  = '';

// Elementos de formulário
const emailForm    = document.getElementById('emailForm');
const passwordForm = document.getElementById('passwordForm');
const registerForm = document.getElementById('registerForm');

// --- Interceptador fetch para capturar 401 (token expirado) ---
(function() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            if (response.status === 401) {
                // Armazena mensagem para exibir no login
                sessionStorage.setItem(
                    'toastMessage',
                    'Seu token expirou. Faça login novamente.'
                );
                // Redireciona imediatamente ao login
                window.location.href = 'index.html';
                return Promise.reject(new Error('Token expirado'));
            }
            return response;
        } catch (err) {
            return Promise.reject(err);
        }
    };
})();

// --- DOMContentLoaded: exibe toast caso exista e inicia fluxos ---
document.addEventListener('DOMContentLoaded', () => {
    // 0) Exibe toast de mensagem pendente (ex: token expirado)
    const pendingToast = sessionStorage.getItem('toastMessage');
    if (pendingToast) {
        showToast(pendingToast);
        sessionStorage.removeItem('toastMessage');
    }

    // 1) Etapa de e-mail no login
    if (emailForm) {
        emailForm.addEventListener('submit', async e => {
            e.preventDefault();
            clearFieldErrors('emailForm');

            const email = document.getElementById('emailInput').value.trim();
            if (!isEmailValid(email)) {
                showFieldError('emailInput', 'E-mail inválido');
                return;
            }

            try {
                showLoader();
                const { exists, confirmed, firstName, lastName } = await checkUserExists(email);

                if (!exists) {
                    showFieldError('emailInput', 'E-mail não cadastrado');
                    return;
                }
                if (!confirmed) {
                    showModal(
                        'Você se registrou, mas ainda não confirmou o e-mail. Verifique sua caixa de entrada.',
                        false
                    );
                    return;
                }

                // Avança para etapa de senha
                currentEmail     = email;
                currentFirstName = firstName;
                currentLastName  = lastName;
                document.getElementById('greeting').innerText =
                    `Bem-vindo, ${currentFirstName} ${currentLastName}!`;
                document.getElementById('login-step-email').classList.add('hidden');
                document.getElementById('login-step-password').classList.remove('hidden');

            } catch (err) {
                showModal('Erro ao verificar e-mail: ' + err.message, false);
            } finally {
                hideLoader();
            }
        });
    }

    // 2) Etapa de senha no login
    if (passwordForm) {
        passwordForm.addEventListener('submit', async e => {
            e.preventDefault();
            clearFieldErrors('passwordForm');

            const password = document.getElementById('passwordInput').value;
            if (!isPasswordStrong(password)) {
                showFieldError('passwordInput', 'Senha deve ter ao menos 6 caracteres');
                return;
            }

            try {
                showLoader();
                // Agora também extrai role do usuário
                const { authenticated, token, role, message } = await loginUser(currentEmail, password);

                if (!authenticated) {
                    showModal(message || 'Falha na autenticação.', false);
                    return;
                }

                // Salva token e dados do usuário
                localStorage.setItem('jwtToken', token);
                localStorage.setItem('firstName', currentFirstName);
                localStorage.setItem('lastName', currentLastName);
                localStorage.setItem('role', role || 'USER');

                // Redireciona ao dashboard
                window.location.href = 'dashboard.html';

            } catch (err) {
                showModal('Erro ao fazer login: ' + err.message, false);
            } finally {
                hideLoader();
            }
        });
    }

    // 3) Fluxo de cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', async e => {
            e.preventDefault();
            clearFieldErrors('registerForm');

            const data = {
                firstName:       document.getElementById('firstName').value.trim(),
                lastName:        document.getElementById('lastName').value.trim(),
                email:           document.getElementById('email').value.trim(),
                password:        document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            const errors = validateRegistration(data);
            if (Object.keys(errors).length) {
                Object.entries(errors)
                    .forEach(([field, msg]) => showFieldError(field, msg));
                return;
            }

            try {
                showLoader();
                await registerUser(data);
                showModal(
                    'Cadastro realizado! Verifique seu e-mail para confirmar.',
                    true
                );
            } catch (err) {
                showModal('Erro ao cadastrar: ' + err.message, false);
            } finally {
                hideLoader();
            }
        });
    }
});
