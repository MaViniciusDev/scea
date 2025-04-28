/**
 * app.js
 * Fluxo de login em 2 etapas, cadastro e confirmação.
 */

let currentEmail     = '';
let currentFirstName = '';
let currentLastName  = '';

const emailForm    = document.getElementById('emailForm');
const passwordForm = document.getElementById('passwordForm');

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
            localStorage.setItem('scea-token', token);
            window.location.href = 'dashboard.html';
        } catch (err) {
            showModal('Erro ao fazer login: ' + err.message, false);
        } finally {
            hideLoader();
        }
    });
}

// Cadastro (register.html)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async e => {
        e.preventDefault();
        clearFieldErrors('registerForm');

        const data = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        const errors = validateRegistration(data);
        if (Object.keys(errors).length) {
            Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
            return;
        }

        try {
            showLoader();
            const token = await registerUser(data);
            showModal('Cadastro realizado! Verifique seu e-mail para confirmar.', true);
        } catch (err) {
            showModal('Erro ao cadastrar: ' + err.message, false);
        } finally {
            hideLoader();
        }
    });
}

// Confirmação (confirm.html)
const params = new URLSearchParams(window.location.search);
if (params.has('token')) {
    (async () => {
        try {
            showLoader();
            const res = await confirmEmail(params.get('token'));
            showModal('E-mail confirmado com sucesso!', true);
        } catch (err) {
            showModal('Erro na confirmação: ' + err.message, false);
        } finally {
            hideLoader();
        }
    })();
}
