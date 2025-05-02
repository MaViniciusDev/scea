// spacesAdminController.js
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import { initSidebar } from './dashboard.js';
import { getAllSpaces, deleteSpaceById, createSpace, updateSpace } from './api.js';

let allSpaces = [];
let editingId = null;
const token = localStorage.getItem('jwtToken');

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupManageSpacesModal();
    setupNewSpaceModal();
    loadSpaceStats();
});

// Carrega estatísticas de espaços
async function loadSpaceStats() {
    showLoader();
    try {
        const spaces = await getAllSpaces(token);
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

// Configura modal de gerenciamento
function setupManageSpacesModal() {
    const btnOpen    = document.getElementById('manageSpacesBtn');
    const modal      = document.getElementById('manageSpacesModal');
    const btnClose   = document.getElementById('closeManageSpacesModal');
    const inputSearch = document.getElementById('spacesSearchInput');
    const listEl     = document.getElementById('spacesList');
    if (!btnOpen || !modal || !btnClose || !inputSearch || !listEl) return;

    btnOpen.addEventListener('click', async () => {
        modal.classList.remove('hidden');
        await fetchAndRenderSpaces();
        inputSearch.value = '';
    });
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    inputSearch.addEventListener('input', () => {
        const term = inputSearch.value.trim().toLowerCase();
        renderSpacesList(
            allSpaces.filter(s => s.name.toLowerCase().includes(term)),
            listEl
        );
    });
}

// Busca e renderiza todos os espaços
async function fetchAndRenderSpaces() {
    showLoader();
    try {
        allSpaces = await getAllSpaces(token);
        renderSpacesList(allSpaces, document.getElementById('spacesList'));
    } catch (err) {
        showModal('Erro ao carregar espaços: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

// Monta lista com ações de editar e excluir
function renderSpacesList(spaces, container) {
    container.innerHTML = '';
    if (!spaces.length) {
        container.innerHTML = '<p>Nenhum espaço cadastrado.</p>';
        return;
    }
    spaces.forEach(space => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="space-name">${space.name}</span>
            <div class="actions">
                <button class="edit-btn" title="Editar">✏️</button>
                <button class="delete-btn" title="Excluir">🗑️</button>
            </div>`;
        li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(space));
        li.querySelector('.delete-btn').addEventListener('click', async () => {
            if (!confirm(`Excluir "${space.name}"?`)) return;
            try {
                showLoader();
                await deleteSpaceById(space.id, token);
                allSpaces = allSpaces.filter(x => x.id !== space.id);
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

// Abre modal de edição e pré-preenche campos
function openEditModal(space) {
    editingId = space.id;
    const modal = document.getElementById('modalCadastroEspaco');
    // Preenche dados
    document.getElementById('nomeEspaco').value = space.name;
    document.getElementById('siglaEspaco').value = space.nameCode;
    document.getElementById('capacidadeEspaco').value = space.capacity;
    document.getElementById('tipoEspaco').value = space.spaceType;

    const hasComputerEl = document.querySelector(`input[name="hasComputer"][value="${space.hasComputer}"]`);
    if (hasComputerEl) {
        hasComputerEl.checked = true;
    }

    let grp = document.getElementById('activeGroup');
    if (!grp) {
        grp = document.createElement('div');
        grp.id = 'activeGroup';
        grp.className = 'radio-group';
        grp.innerHTML = `
            <label>Ativo:</label>
            <label><input type="radio" name="isActive" value="true"> Sim</label>
            <label><input type="radio" name="isActive" value="false"> Não</label>
            <input type="text" id="disableReason" placeholder="Motivo da desativação" class="hidden">`;
        const form = document.getElementById('formCadastroEspaco');
        form.insertBefore(grp, form.querySelector('.modal-footer'));
        grp.querySelectorAll('input[name="isActive"]').forEach(radio => {
            radio.addEventListener('change', e => {
                const reason = document.getElementById('disableReason');
                reason.classList.toggle('hidden', e.target.value === 'true');
            });
        });
    }

    const isActiveEl = document.querySelector(`input[name="isActive"][value="${space.active}"]`);
    if (isActiveEl) {
        isActiveEl.checked = true;
    }

    const reasonEl = document.getElementById('disableReason');
    if (reasonEl) {
        reasonEl.value = space.disableReason || '';
        reasonEl.classList.toggle('hidden', space.active);
    }

    modal.classList.remove('hidden');
}

// Configura modal de cadastro/edição
function setupNewSpaceModal() {
    const btnOpen = document.getElementById('createSpaceBtn');
    const modal   = document.getElementById('modalCadastroEspaco');
    const btnClose = document.getElementById('closeCadastroEspacoModal');
    const btnCancel = document.getElementById('cancelarCadastroEspaco');
    const form = document.getElementById('formCadastroEspaco');
    if (!btnOpen || !modal || !btnClose || !btnCancel || !form) return;

    btnOpen.addEventListener('click', () => {
        editingId = null;
        form.reset();
        const grp = document.getElementById('activeGroup');
        if (grp) grp.remove();
        modal.classList.remove('hidden');
    });
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    btnCancel.addEventListener('click', () => modal.classList.add('hidden'));

    form.addEventListener('submit', async e => {
        e.preventDefault();
        showLoader();
        try {
            const hasCompVal = document.querySelector('input[name="hasComputer"]:checked')?.value === 'true';
            const activeVal = document.querySelector('input[name="isActive"]:checked')?.value;
            const active = activeVal == null ? true : activeVal === 'true';
            const disableReason = document.getElementById('disableReason')?.value.trim() || '';
            const payload = {
                name: document.getElementById('nomeEspaco').value.trim(),
                nameCode: document.getElementById('siglaEspaco').value.trim(),
                capacity: parseInt(document.getElementById('capacidadeEspaco').value, 10),
                spaceType: document.getElementById('tipoEspaco').value,
                hasComputer: hasCompVal,
                active: active,
                disableReason: disableReason,
                description: document.getElementById('observacoesEspaco').value.trim()
            };
            if (editingId) {
                await updateSpace(editingId, payload, token);
                showToast('Espaço atualizado com sucesso!');
            } else {
                await createSpace(payload, token);
                showToast('Espaço cadastrado com sucesso!');
            }
            modal.classList.add('hidden');
            await fetchAndRenderSpaces();
            await loadSpaceStats();
        } catch (err) {
            showModal(`Erro ao ${editingId ? 'atualizar' : 'cadastrar'} espaço: ${err.message}`, false);
        } finally {
            hideLoader();
        }
    });
}
