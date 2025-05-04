// config.js
import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import { updateUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupForm();
});

function setupForm() {
    // pré-carrega valores do localStorage
    const firstName = localStorage.getItem('firstName') || '';
    const lastName  = localStorage.getItem('lastName')  || '';
    const email     = localStorage.getItem('email')     || '';

    const fullNameInput = document.getElementById('fullName');
    const emailInput    = document.getElementById('email');

    fullNameInput.value = `${firstName} ${lastName}`.trim();
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

            // separa em primeiro e último nome
            const parts = fullName.split(' ');
            const newFirst = parts.shift();
            const newLast  = parts.join(' ') || '';

            showLoader();
            try {
                const token = localStorage.getItem('jwtToken');
                await updateUserProfile({ firstName: newFirst, lastName: newLast }, token);
                // atualiza localStorage e sidebar
                localStorage.setItem('firstName', newFirst);
                localStorage.setItem('lastName', newLast);
                showToast('Nome atualizado com sucesso!');
                initSidebar();
            } catch (err) {
                showModal('Erro ao salvar: ' + err.message, false);
            } finally {
                hideLoader();
            }
        });
}
