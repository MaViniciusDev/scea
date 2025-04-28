// app.js
// Fluxo de login em 2 etapas e cadastro.

// estado global
let currentEmail     = '';
let currentFirstName = '';
let currentLastName  = '';

// elementos de formulário
const emailForm    = document.getElementById('emailForm');
const passwordForm = document.getElementById('passwordForm');
const registerForm = document.getElementById('registerForm');

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

            // avançar para a etapa de senha
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
            const { authenticated, token, message } = await loginUser(currentEmail, password);

            if (!authenticated) {
                showModal(message || 'Falha na autenticação.', false);
                return;
            }

            // salva token e redireciona
            localStorage.setItem('scea-token', token);
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

        // validações básicas (campo a campo)
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
