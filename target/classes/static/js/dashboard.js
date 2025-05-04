// dashboard.js
import {hideLoader, showLoader, showModal} from './ui.js';
import {getAllSpaces, getNextReservations} from './api.js';

// Inicializa a sidebar com base em dados do localStorage
export function initSidebar() {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName  = localStorage.getItem('lastName')  || '';
    const role      = localStorage.getItem('role')      || '';

    const menuItems = document.getElementById('menuItems');
    if (menuItems) {
        const links = (role === 'ADMIN')
            ? [
                { text: 'Dashboard',     href: 'dashboard.html' },
                { text: 'Reservas',      href: 'reservations.html'  },
                { text: 'Espaços Acad.', href: 'spacesAdminOverview.html' },
                { text: 'Professores',   href: 'users.html'  },
                { text: 'Configurações', href: 'config.html' }
            ]
            : [
                { text: 'Início',        href: 'dashboard.html'       },
                { text: 'Reservas',      href: 'reservations.html'    },
                { text: 'Configurações', href: 'config.html'          }
            ];
        menuItems.innerHTML = links
            .map(li => `<li><a href="${li.href}">${li.text}</a></li>`)
            .join('');
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', e => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = (role === 'ADMIN')
            ? `${firstName} ADMIN`
            : `${firstName} ${lastName}`;
    }
}

const token = localStorage.getItem('jwtToken');

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();

    // carrega cards de próximas reservas
    if (document.getElementById('nextReservations')) {
        loadNextReservations();
    }

    // carrega calendário se existir
    if (document.getElementById('calendarContainer')) {
        loadCalendar();
    }

    // setup do botão “Ver todos os espaços”
    const btnAll = document.getElementById('viewAllSpaces');
    if (btnAll) {
        btnAll.addEventListener('click', openAllSpacesModal);
    }
    document
        .getElementById('closeAllSpaces')
        ?.addEventListener('click', closeAllSpacesModal);
});

async function loadNextReservations() {
    const container = document.getElementById('nextReservations');
    if (!container) return;
    container.innerHTML = '';
    showLoader();
    try {
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

function loadCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    container.innerHTML = '<p>Calendário será implementado aqui.</p>';
}

// --------------------------------------------------------
// Modal “Todos os Espaços” (Ativos / Inativos)
// --------------------------------------------------------

async function openAllSpacesModal() {
    const modal         = document.getElementById('allSpacesModal');
    const activeGrid    = document.getElementById('activeSpacesGrid');
    const inactiveGrid  = document.getElementById('inactiveSpacesGrid');

    modal.classList.remove('hidden');
    showLoader();
    try {
        const spaces = await getAllSpaces(token);
        activeGrid.innerHTML   = '';
        inactiveGrid.innerHTML = '';

        spaces.forEach(s => {
            const card = document.createElement('div');
            card.className = 'space-card' + (s.active ? '' : ' inactive');
            card.textContent = s.name;

            if (!s.active) {
                card.dataset.reason = s.disableReason || 'Sem motivo informado';
            }

            (s.active ? activeGrid : inactiveGrid).appendChild(card);
        });


        if (!activeGrid.children.length) {
            activeGrid.innerHTML = '<p>— nenhum espaço ativo </p>';
        }
        if (!inactiveGrid.children.length) {
            inactiveGrid.innerHTML = '<p>— nenhum espaço inativo </p>';
        }
    } catch (err) {
        activeGrid.innerHTML   = `<p>Erro: ${err.message}</p>`;
        inactiveGrid.innerHTML = '';
    } finally {
        hideLoader();
    }
}

function closeAllSpacesModal() {
    document.getElementById('allSpacesModal').classList.add('hidden');
}
