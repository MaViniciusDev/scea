// dashboard.js
import { showLoader, hideLoader, showModal } from './ui.js';
import { getNextReservations, getActiveSpaces } from './api.js';

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
                { text: 'Professores',   href: 'professores.html'  },
                { text: 'Configurações', href: 'config.html' }
            ]
            : [
                { text: 'Início',        href: 'dashboard.html'       },
                { text: 'Reservas',      href: 'reservations.html' },
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

    if (document.getElementById('nextReservations')) {
        loadNextReservations();
    }

    if (document.getElementById('calendarContainer')) {
        loadCalendar();
    }

    const btn = document.getElementById('viewAllSpaces');
    if (btn) {
        loadTopSpaces();
        btn.addEventListener('click', () => {
            const role = localStorage.getItem('role');
            window.location.href = role === 'ADMIN'
                ? 'spaces-admin.html'
                : 'spaces-user.html';
        });
    }
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
          <div class=\"reserva-badge\">Reservado</div>
          <div class=\"reserva-data\">${new Date(r.reservationDate).toLocaleDateString()}</div>
          <div class=\"reserva-espaco\">${r.academicSpaces.name}</div>
          <div class=\"reserva-horario\">${r.reservationInit.slice(0,5)} - ${r.reservationEnd.slice(0,5)}</div>`;
                container.appendChild(card);
            });
        }
    } catch (err) {
        showModal('Erro ao carregar reservas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

async function loadTopSpaces() {
    const list = document.getElementById('topSpacesList');
    if (!list) return;
    list.innerHTML = '';
    showLoader();
    try {
        const spaces = await getActiveSpaces(token);
        spaces
            .sort((a, b) => (b.reservationsCount || 0) - (a.reservationsCount || 0))
            .slice(0, 6)
            .forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `<a href=\"space-detail.html?id=${s.id}\">${s.name}</a>`;
                list.appendChild(li);
            });
    } catch (err) {
        showModal('Não foi possível carregar espaços: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

function loadCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    container.innerHTML = '<p>Calendário será implementado aqui.</p>';
}
