// src/main/resources/static/js/forgotPasswordController.js
import { showLoader, hideLoader, showModal as exibirModalMensagem } from './ui.js';
import { API_BASE } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('forgotForm');
    const emailInput = document.getElementById('forgotEmail');
    const errorSpan  = document.getElementById('error-forgotEmail');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        errorSpan.textContent = '';

        const email = emailInput.value.trim();
        if (!email) {
            errorSpan.textContent = 'Informe seu e-mail.';
            return;
        }

        showLoader();
        try {
            const resp = await fetch(
                `${API_BASE}/auth/forgot-password?email=${encodeURIComponent(email)}`,
                { method: 'POST' }
            );
            const text = await resp.text();
            if (!resp.ok) throw new Error(text || 'Erro ao solicitar redefinição de senha.');

            // Exibe modal de sucesso
            exibirModalMensagem(text, true);
            form.reset();
        } catch (err) {
            // Exibe erro abaixo do campo
            errorSpan.textContent = err.message;
        } finally {
            hideLoader();
        }
    });
});
