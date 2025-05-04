// config.js
import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import { updateUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupForm();
});

function setupForm() {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName  = localStorage.getItem('lastName')  || '';
    const email     = localStorage.getItem('email')     || '';

    const fullNameInput = document.getElementById('fullName');
    const emailInput    = document.getElementById('email');

    fullNameInput.value = [firstName, lastName].filter(Boolean).join(' ');
    emailInput.value    = email;

    document
        .getElementById('profileForm')
        .addEventListener('submit', async e => {
            e.preventDefault();
            const fullName = fullNameInput.value.trim();
            if (!fullName) {
                showModal('O nome não pode ficar vazio.', false);
                return;
            }

            // SPLIT MAIS ROBUSTO: primeiro token é firstName, o resto é lastName
            const parts    = fullName.split(/\s+/);
            const newFirst = parts.shift();
            const newLast  = parts.length ? parts.join(' ') : '';

            showLoader();
            try {
                const token = localStorage.getItem('jwtToken');
                await updateUserProfile({ firstName: newFirst, lastName: newLast }, token);

                // atualiza localStorage e sidebar
                localStorage.setItem('firstName', newFirst);
                localStorage.setItem('lastName',  newLast);
                showToast('Perfil salvo com sucesso!');
                initSidebar();
            } catch (err) {
                showModal('Erro ao salvar: ' + err.message, false);
            } finally {
                hideLoader();
            }
        });
}
