// reservationsController.js
import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal } from './ui.js';
import { getNextReservations } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setupButtons();
    loadNextReservations();
});

// Função modificada para criar grupos de ação
    function setupButtons() {
        const role = localStorage.getItem('role');
        const container = document.querySelector('.centered-action');
        if (!container) return;
        container.innerHTML = '';

        // Helper para criar grupos de botão + label
        const createActionGroup = (button, label) => {
            const group = document.createElement('div');
            group.className = 'action-group';
            group.appendChild(button);
            group.appendChild(label);
            return group;
        };

        // Botão Ver Minhas Reservas
        const btnView = document.createElement('button');
        btnView.id = 'viewMyRes';
        btnView.className = 'circle-btn';
        btnView.textContent = '👁️';
        btnView.addEventListener('click', () => window.location.href = 'minhas-reservas.html');
        const lblView = document.createElement('p');
        lblView.textContent = 'Ver minhas reservas';
        container.appendChild(createActionGroup(btnView, lblView));

        // Botão Solicitar Nova Reserva
        const btnNew = document.createElement('button');
        btnNew.id = 'newResBtn';
        btnNew.className = 'circle-btn';
        btnNew.textContent = '＋';
        btnNew.addEventListener('click', () => window.location.href = 'nova-reserva.html');
        const lblNew = document.createElement('p');
        lblNew.textContent = 'Solicitar novas reservas';
        container.appendChild(createActionGroup(btnNew, lblNew));

        // Se ADMIN, adicionar botão Gerenciar Reservas
        if (role === 'ADMIN') {
            const btnManage = document.createElement('button');
            btnManage.id = 'manageResBtn';
            btnManage.className = 'circle-btn';
            btnManage.textContent = '🛠️';
            btnManage.addEventListener('click', () => window.location.href = 'gerenciar-reservas.html');
            const lblManage = document.createElement('p');
            lblManage.textContent = 'Gerenciar reservas';
            container.appendChild(createActionGroup(btnManage, lblManage));
        }
    }

// Carrega próximas reservas
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