// loginController.js
// Orquestra o fluxo de login em duas etapas.

import {
    showLoader,
    hideLoader,
    showModal,
    showFieldError,
    clearFieldErrors,
    showToast
} from './ui.js';

import { checkUserExists, loginUser } from './api.js';

import { isEmailValid, isPasswordStrong } from './validation.js';

let currentEmail = '';
let currentFirstName = '';
let currentLastName = '';

document.addEventListener('DOMContentLoaded', () => {
    // 0) Toast pendente (token expirado)
    const pendingToast = sessionStorage.getItem('toastMessage');
    if (pendingToast) {
        showToast(pendingToast);
        sessionStorage.removeItem('toastMessage');
    }

    const emailForm = document.getElementById('emailForm');
    const passwordForm = document.getElementById('passwordForm');

    if (emailForm) {
        emailForm.addEventListener('submit', onEmailSubmit);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', onPasswordSubmit);
    }
});

async function onEmailSubmit(e) {
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
        currentEmail = email;
        currentFirstName = firstName;
        currentLastName = lastName;
        document.getElementById('greeting').innerText =
            `Bem-vindo, ${firstName} ${lastName}!`;
        document.getElementById('login-step-email').classList.add('hidden');
        document.getElementById('login-step-password').classList.remove('hidden');

    } catch (err) {
        showModal('Erro ao verificar e-mail: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

async function onPasswordSubmit(e) {
    e.preventDefault();
    clearFieldErrors('passwordForm');

    const password = document.getElementById('passwordInput').value;
    if (!isPasswordStrong(password)) {
        showFieldError('passwordInput', 'Senha deve ter ao menos 6 caracteres');
        return;
    }

    try {
        showLoader();
        const { authenticated, token, role, message } =
            await loginUser(currentEmail, password);

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
}
