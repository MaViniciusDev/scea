// spacesAdminController.js
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import { initSidebar } from './dashboard.js';
import { getActiveSpaces, deleteSpaceById, createSpace } from './api.js';

let allSpaces = [];
const token = localStorage.getItem('jwtToken');

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupManageSpacesModal();
    setupNewSpaceModal();
    loadSpaceStats();
});

// Estatísticas
async function loadSpaceStats() {
    showLoader();
    try {
        const spaces = await getActiveSpaces(token);
        const counts = spaces.reduce((acc, s) => {
            const type = (s.spaceType || 'SALA').toUpperCase();
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        document.getElementById('totalLabs').textContent  = counts['LAB'] || 0;
        document.getElementById('totalAud').textContent   = counts['AUDITORIO'] || 0;
        document.getElementById('totalRooms').textContent = counts['SALA'] || 0;
    } catch (err) {
        showModal('Erro ao carregar estatísticas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

// Modal Gerenciar
function setupManageSpacesModal() {
    const openBtn  = document.getElementById('manageSpacesBtn');
    const modal    = document.getElementById('manageSpacesModal');
    const closeBtn = document.getElementById('closeManageSpacesModal');
    const searchIn = document.getElementById('spacesSearchInput');
    const listEl   = document.getElementById('spacesList');
    if (!openBtn || !modal || !closeBtn || !searchIn || !listEl) return;

    openBtn.addEventListener('click', async () => {
        modal.classList.remove('hidden');
        await fetchAndRenderSpaces();
        searchIn.value = '';
    });
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    searchIn.addEventListener('input', () => {
        const term = searchIn.value.trim().toLowerCase();
        renderSpacesList(
            allSpaces.filter(s => s.name.toLowerCase().includes(term)),
            listEl
        );
    });
}

async function fetchAndRenderSpaces() {
    showLoader();
    try {
        allSpaces = await getActiveSpaces(token);
        renderSpacesList(allSpaces, document.getElementById('spacesList'));
    } catch (err) {
        showModal('Erro ao carregar espaços: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

function renderSpacesList(spaces, container) {
    container.innerHTML = '';
    if (spaces.length === 0) {
        container.innerHTML = '<p>Nenhum espaço cadastrado.</p>';
        return;
    }
    spaces.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `
      <span class="space-name">${s.name}</span>
      <div class="actions">
        <button class="edit-btn" title="Editar">✏️</button>
        <button class="delete-btn" title="Excluir">🗑️</button>
      </div>`;
        li.querySelector('.edit-btn')
            .addEventListener('click', () => window.location.href = `spaces-admin.html?id=${s.id}`);
        li.querySelector('.delete-btn')
            .addEventListener('click', async () => {
                if (!confirm(`Excluir "${s.name}"?`)) return;
                try {
                    showLoader();
                    await deleteSpaceById(s.id, token);
                    allSpaces = allSpaces.filter(x => x.id !== s.id);
                    renderSpacesList(allSpaces, container);
                    await loadSpaceStats();
                    showToast('Espaço excluído com sucesso!');
                } catch (err) {
                    showModal('Erro ao excluir: ' + err.message, false);
                } finally {
                    hideLoader();
                }
            });
        container.appendChild(li);
    });
}

// Modal Novo Espaço
function setupNewSpaceModal() {
    const openBtn   = document.getElementById('createSpaceBtn');
    const modal     = document.getElementById('modalCadastroEspaco');
    const closeBtn  = document.getElementById('closeCadastroEspacoModal');
    const cancelBtn = document.getElementById('cancelarCadastroEspaco');
    const form      = document.getElementById('formCadastroEspaco');
    if (!openBtn || !modal || !closeBtn || !cancelBtn || !form) return;

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    form.addEventListener('submit', async e => {
        e.preventDefault();
        showLoader();
        const nome        = document.getElementById('nomeEspaco').value.trim();
        const sigla       = document.getElementById('siglaEspaco').value.trim();
        const capacidade  = parseInt(document.getElementById('capacidadeEspaco').value, 10);
        const tipo        = document.getElementById('tipoEspaco').value;
        const hasComputer = document.querySelector('input[name="hasComputer"]:checked').value === 'true';
        const obs         = document.getElementById('observacoesEspaco').value.trim();

        const payload = {
            name:       nome,
            nameCode:   sigla,
            capacity:   capacidade,
            spaceType:  tipo,
            hasComputer,
            description: obs
        };

        try {
            await createSpace(payload, token);
            modal.classList.add('hidden');
            await fetchAndRenderSpaces();
            await loadSpaceStats();
            showToast('Espaço cadastrado com sucesso!');
        } catch (err) {
            showModal('Erro ao cadastrar espaço: ' + err.message, false);
        } finally {
            hideLoader();
        }
    });
}
