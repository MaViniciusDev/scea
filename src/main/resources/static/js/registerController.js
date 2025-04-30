// registerController.js
// Orquestra o fluxo de cadastro.

import {
    showLoader,
    hideLoader,
    showModal,
    showFieldError,
    clearFieldErrors
} from './ui.js';

import { registerUser } from './api.js';

import {
    isEmailValid,
    isPasswordStrong,
    validateRegistration
} from './validation.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', onRegisterSubmit);
    }
});

async function onRegisterSubmit(e) {
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
        Object.entries(errors).forEach(([field, msg]) =>
            showFieldError(field, msg)
        );
        return;
    }

    try {
        showLoader();
        await registerUser(data);
        showModal('Cadastro realizado! Verifique seu e-mail para confirmar.', true);
    } catch (err) {
        showModal('Erro ao cadastrar: ' + err.message, false);
    } finally {
        hideLoader();
    }
}
