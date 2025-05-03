// reservationsController.js
import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal } from './ui.js';
import {
    getNextReservations,
    getAllSpaces,
    createReservation
} from './api.js';

let allSpaces = [];
let selectedSpace = null;

// ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupButtons();


    // handlers do modal de nova reserva
    document
        .getElementById('newResBtn')
        ?.addEventListener('click', openNewResModal);
    document
        .getElementById('closeNewRes')
        ?.addEventListener('click', closeNewResModal);
    document
        .getElementById('submitReservation')
        ?.addEventListener('click', submitReservation);
    setupFormFilters();
    preencherHorarios();
});
function preencherHorarios() {
    const start = document.getElementById('startTime');
    const end = document.getElementById('endTime');
    if (!start || !end) return;

    start.innerHTML = '<option value="">Início</option>';
    end.innerHTML = '<option value="">Fim</option>';

    for (let h = 6; h <= 23; h++) {
        for (let m of [0, 30]) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const val = `${hh}:${mm}`;
            const opt1 = new Option(val, val);
            const opt2 = new Option(val, val);
            start.appendChild(opt1);
            end.appendChild(opt2);
        }
    }
}

// monta os 2 ou 3 botões na area central
function setupButtons() {
    const role = localStorage.getItem('role');
    const container = document.querySelector('.centered-action');
    if (!container) return;
    container.innerHTML = '';

    const makeGroup = (id, icon, text, href) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.className = 'circle-btn';
        btn.textContent = icon;
        btn.addEventListener('click', () => {
            if (href) location.href = href;
        });
        const lbl = document.createElement('p');
        lbl.textContent = text;
        const grp = document.createElement('div');
        grp.className = 'action-group';
        grp.append(btn, lbl);
        return grp;
    };

    container.append(
        makeGroup('viewMyRes', '👁️', 'Ver minhas reservas', 'minhas-reservas.html'),
        makeGroup('newResBtn', '＋', 'Solicitar novas reservas')
    );
    if (role === 'ADMIN') {
        container.append(
            makeGroup('manageResBtn', '🛠️', 'Gerenciar reservas', 'gerenciar-reservas.html')
        );
    }
}

// carrega e exibe os cards de próximas reservas
async function loadNextReservations() {
    const container = document.getElementById('nextReservations');
    if (!container) return;
    container.innerHTML = '';
    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        const reservas = await getNextReservations(token);
        if (!reservas.length) {
            container.innerHTML = '<p>Sem próximas reservas.</p>';
        } else {
            reservas.slice(0, 5).forEach(r => {
                const card = document.createElement('div');
                card.className = 'reserva-card';
                card.innerHTML = `
          <div class="reserva-badge">Reservado</div>
          <div class="reserva-data">${new Date(r.reservationDate).toLocaleDateString()}</div>
          <div class="reserva-espaco">${r.academicSpaces.name}</div>
          <div class="reserva-horario">${r.reservationInit.slice(0,5)} - ${r.reservationEnd.slice(0,5)}</div>`;
                container.appendChild(card);
            });
        }
    } catch (err) {
        showModal('Erro ao carregar reservas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

// abre o modal e carrega todos os espaços
async function openNewResModal() {
    const modal = document.getElementById('newReservationModal');
    modal.classList.remove('hidden');
    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        allSpaces = await getAllSpaces(token);
        renderSpaces(allSpaces);

        // === validação de data e horário ===
        const dateInput  = document.getElementById('date');
        const startInput = document.getElementById('startTime');
        const endInput   = document.getElementById('endTime');
        const today      = new Date().toISOString().split('T')[0];
        dateInput.min = today;

        function updateMinTimes() {
            const selected = dateInput.value;
            if (selected === today) {
                const now = new Date();
                const hh = String(now.getHours()).padStart(2, '0');
                const mm = String(now.getMinutes()).padStart(2, '0');
                startInput.min = `${hh}:${mm}`;
            } else {
                startInput.min = '00:00';
            }
            endInput.min = startInput.value || startInput.min;
        }

        dateInput.addEventListener('change', updateMinTimes);
        startInput.addEventListener('change', () => {
            endInput.min = startInput.value;
        });
        updateMinTimes();
        // === fim validação ===

    } catch (err) {
        showModal('Erro ao carregar espaços: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

// fecha modal e limpa estado
function closeNewResModal() {
    document.getElementById('newReservationModal').classList.add('hidden');
    resetFormAndSelection();
}

// exibe cards no grid
function renderSpaces(spaces) {
    const grid = document.getElementById('spacesGrid');
    grid.innerHTML = '';
    if (!spaces.length) {
        grid.innerHTML = '<p>Nenhum espaço disponível.</p>';
        return;
    }
    spaces.forEach(s => {
        const card = document.createElement('div');
        card.className = 'reserva-card';
        card.textContent = s.name;
        card.addEventListener('click', () => selectSpace(card, s));
        if (selectedSpace?.id === s.id) {
            card.classList.add('selected');
        }
        grid.appendChild(card);
    });
}

// marca card selecionado e preenche filtros
function selectSpace(cardEl, space) {
    document
        .querySelectorAll('.spaces-grid .reserva-card.selected')
        .forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    selectedSpace = space;

    // preenche o form
    document.getElementById('spaceType').value = space.spaceType;
    document.getElementById('capacity').value  = space.capacity;
    document.getElementById('hasComputer').checked = space.hasComputer;
}

// configura filtro reativo no form e na busca
function setupFormFilters() {
    const form = document.getElementById('reservationForm');
    const search = document.getElementById('searchSpace');
    form.addEventListener('input', filterSpaces);
    search.addEventListener('input', filterSpaces);
}

// filtra e rerenderiza cards
function filterSpaces() {
    const typeVal = document.getElementById('spaceType').value;
    const capVal  = parseInt(document.getElementById('capacity').value) || 0;
    const hasComp = document.getElementById('hasComputer').checked;
    const term    = document.getElementById('searchSpace').value.trim().toLowerCase();

    const filtered = allSpaces.filter(s => {
        if (typeVal && s.spaceType !== typeVal) return false;
        if (s.capacity < capVal) return false;
        if (hasComp && !s.hasComputer) return false;
        return !(term && !s.name.toLowerCase().includes(term));

    });
    renderSpaces(filtered);
}

// envia payload de reserva e fecha modal
async function submitReservation() {
    if (!selectedSpace) {
        showModal('Selecione um espaço antes de enviar.', false);
        return;
    }

    const date      = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime   = document.getElementById('endTime').value;
    const type      = document.querySelector('input[name="type"]:checked').value;

    if (!date || !startTime || !endTime) {
        showModal('Preencha data e horário.', false);
        return;
    }

    const payload = {
        academicSpaces: { id: selectedSpace.id },
        reservationDate: date,
        reservationInit: startTime,
        reservationEnd:  endTime,
        type
    };

    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        await createReservation(payload, token);
        showModal('Reserva criada com sucesso!', true);
        closeNewResModal();
        loadNextReservations();
    } catch (err) {
        showModal('Erro ao criar reserva: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

// limpa form, busca e seleção
function resetFormAndSelection() {
    document.getElementById('reservationForm').reset();
    document.getElementById('searchSpace').value = '';
    selectedSpace = null;
    document.getElementById('spacesGrid').innerHTML = '';
}
