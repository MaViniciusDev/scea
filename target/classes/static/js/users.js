// users.js
import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import {
    getAllProfessors,
    deleteProfessor,
    updateUserRole
} from './api.js';

let professors = [];
const currentEmail = localStorage.getItem('email');

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    loadProfessors();
    document.getElementById('searchProfessor')
        .addEventListener('input', filterProfessors);
});

async function loadProfessors() {
    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        professors = await getAllProfessors(token);
        renderProfessors(professors);
    } catch (err) {
        showModal('Erro ao carregar professores: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

function renderProfessors(list) {
    const ul = document.getElementById('professorsList');
    const tpl = document.getElementById('professorItemTemplate');
    ul.innerHTML = '';

    if (!list.length) {
        ul.innerHTML = '<li>Nenhum professor cadastrado.</li>';
        return;
    }

    list.forEach(p => {
        const clone = tpl.content.cloneNode(true);
        clone.querySelector('.user-name').textContent =
            `${p.firstName} ${p.lastName}`;

        // Role selector
        const select = clone.querySelector('.role-select');
        select.value = p.appUserRole || 'USER';
        select.addEventListener('change', async () => {
            const newRole = select.value;
            if (!confirm(`Alterar role de ${p.firstName} para ${newRole}?`)) {
                select.value = p.appUserRole;
                return;
            }
            showLoader();
            try {
                const token = localStorage.getItem('jwtToken');
                await updateUserRole(p.id, newRole, token);
                showToast(`Role de ${p.firstName} alterada para ${newRole}`);
                p.appUserRole = newRole;
            } catch (err) {
                showModal('Erro ao alterar role: ' + err.message, false);
                select.value = p.appUserRole;
            } finally {
                hideLoader();
            }
        });

        // Delete button
        const btnDelete = clone.querySelector('.btn-delete');
        if (p.email === currentEmail) {
            // não permite excluir a si mesmo
            btnDelete.remove();
        } else {
            btnDelete.addEventListener('click', async () => {
                if (!confirm(`Excluir ${p.firstName} ${p.lastName}?`)) return;
                showLoader();
                try {
                    const token = localStorage.getItem('jwtToken');
                    await deleteProfessor(p.id, token);
                    showToast('Professor excluído com sucesso');
                    loadProfessors();
                } catch (err) {
                    showModal('Erro ao excluir professor: ' + err.message, false);
                } finally {
                    hideLoader();
                }
            });
        }

        ul.appendChild(clone);
    });
}

function filterProfessors() {
    const term = document.getElementById('searchProfessor')
        .value.trim()
        .toLowerCase();
    renderProfessors(
        professors.filter(p =>
            (`${p.firstName} ${p.lastName}`)
                .toLowerCase()
                .includes(term)
        )
    );
}
