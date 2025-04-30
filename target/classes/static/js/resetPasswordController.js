// resetPasswordController.js
import { showLoader, hideLoader, showModal as exibirModalMensagem } from './ui.js';
import { API_BASE } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('resetForm');
    const pwdInput   = document.getElementById('newPassword');
    const confInput  = document.getElementById('confirmNewPassword');
    const errPwd     = document.getElementById('error-newPassword');
    const errConf    = document.getElementById('error-confirmNewPassword');

    // Extrai token da URL: reset-password.html?token=XXX
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        exibirModalMensagem('Token não fornecido.', false);
        form.querySelector('button').disabled = true;
        return;
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        errPwd.textContent = '';
        errConf.textContent = '';

        const newPwd  = pwdInput.value;
        const confirm = confInput.value;
        if (newPwd !== confirm) {
            errConf.textContent = 'As senhas não coincidem.';
            return;
        }

        showLoader();
        try {
            const resp = await fetch(
                `${API_BASE}/auth/reset-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, newPassword: newPwd })
                }
            );
            const text = await resp.text();
            if (!resp.ok) throw new Error(text || 'Erro ao redefinir senha.');
            exibirModalMensagem(text, true);
            form.reset();
        } catch (err) {
            exibirModalMensagem(err.message, false);
        } finally {
            hideLoader();
        }
    });
});
