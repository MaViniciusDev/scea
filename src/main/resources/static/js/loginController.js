// loginController.js
// Orquestra o fluxo de login em duas etapas, usando auth.js para autenticação
import {
    showLoader,
    hideLoader,
    showModal,
    showFieldError,
    clearFieldErrors
} from './ui.js';
import { checkUserExists } from './api.js';
import { isEmailValid, isPasswordStrong } from './validation.js';
import { performLogin } from './auth.js';

let currentEmail = '';
let currentFirstName = '';
let currentLastName = '';

document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('emailForm');
    const passwordForm = document.getElementById('passwordForm');

    if (emailForm) emailForm.addEventListener('submit', onEmailSubmit);
    if (passwordForm) passwordForm.addEventListener('submit', onPasswordSubmit);
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

        currentEmail = email;
        currentFirstName = firstName;
        currentLastName = lastName;
        document.getElementById('greeting').innerText =
            `Bem-vindo, ${currentFirstName} ${currentLastName}!`;
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

    await performLogin(currentEmail, password, role => {
        localStorage.setItem('firstName', currentFirstName);
        localStorage.setItem('lastName', currentLastName);
        localStorage.setItem('role', role || 'USER');
        window.location.href = 'dashboard.html';
    });
}

export { onEmailSubmit, onPasswordSubmit };
