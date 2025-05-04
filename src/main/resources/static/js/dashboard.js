// dashboard.js
import { hideLoader, showLoader, showModal } from './ui.js';
import {
    getNextReservations,
    getAllSpaces,     // traz todos os espaços
    getUserReservations
} from './api.js';

// Inicializa a sidebar...
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
                { text: 'Início',        href: 'dashboard.html'    },
                { text: 'Reservas',      href: 'reservations.html' },
                { text: 'Configurações', href: 'config.html'       }
            ];
        menuItems.innerHTML = links
            .map(li => `<li><a href="${li.href}">${li.text}</a></li>`)
            .join('');
    }

    document.getElementById('logoutLink')
        ?.addEventListener('click', e => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });

    document.getElementById('userInfo').textContent =
        role === 'ADMIN'
            ? `${firstName} ADMIN`
            : `${firstName} ${lastName}`;
}

const token = localStorage.getItem('jwtToken');

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    if (document.getElementById('nextReservations')) loadNextReservations();
    if (document.getElementById('calendarContainer')) initCalendar();
    document.getElementById('viewAllSpaces')
        ?.addEventListener('click', openAllSpacesModal);
    document.getElementById('closeAllSpaces')
        ?.addEventListener('click', closeAllSpacesModal);
});

// Próximas reservas (dashboard)
async function loadNextReservations() {
    const container = document.getElementById('nextReservations');
    container.innerHTML = '';
    showLoader();
    try {
        const reservas = await getNextReservations(token);
        if (!reservas.length) {
            container.innerHTML = '<p>Sem próximas reservas.</p>';
        } else {
            reservas.slice(0,5).forEach(r => {
                const card = document.createElement('div');
                card.className = 'reserva-card';
                card.innerHTML = `
          <div class="reserva-badge">Reservado</div>
          <div class="reserva-data">${new Date(r.reservationDate)
                    .toLocaleDateString()}</div>
          <div class="reserva-espaco">${r.academicSpaces.name}</div>
          <div class="reserva-horario">
            ${r.reservationInit.slice(0,5)} - ${r.reservationEnd.slice(0,5)}
          </div>`;
                container.appendChild(card);
            });
        }
    } catch (err) {
        showModal('Erro ao carregar reservas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

// --------------------------------------------------------
// CALENDÁRIO
// --------------------------------------------------------
async function initCalendar() {
    const container = document.getElementById('calendarContainer');
    const prevBtn   = container.querySelector('.prev-month');
    const nextBtn   = container.querySelector('.next-month');
    const monthName = container.querySelector('.month-name');
    const daysGrid  = container.querySelector('.days-grid');
    const countNum  = container.querySelector('.count-number');

    showLoader();
    let reservations = [];
    try {
        reservations = await getUserReservations(token);
    } catch (err) {
        showModal('Erro ao carregar reservas: ' + err.message, false);
        hideLoader();
        return;
    }
    hideLoader();

    // Agrupa por data YYYY-MM-DD
    const byDate = reservations.reduce((acc, r) => {
        acc[r.reservationDate] = (acc[r.reservationDate] || 0) + 1;
        return acc;
    }, {});

    let current = new Date();

    function renderCalendar() {
        daysGrid.innerHTML = '';
        const year  = current.getFullYear();
        const month = current.getMonth();

        monthName.textContent = current.toLocaleString('pt-BR', {
            month: 'long', year: 'numeric'
        });

        const firstDay  = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month+1, 0).getDate();
        const offset    = firstDay;
        let monthCount  = 0;

        for (let i=0; i<offset+totalDays; i++) {
            const cell = document.createElement('div');
            cell.className = 'day';
            if (i < offset) {
                cell.classList.add('inactive');
            } else {
                const dayNum = i-offset+1;
                const dateStr = new Date(year,month,dayNum)
                    .toISOString().split('T')[0];
                cell.textContent = dayNum;

                const today = new Date();
                if (year === today.getFullYear() &&
                    month === today.getMonth() &&
                    dayNum === today.getDate()) {
                    cell.classList.add('today');
                }
                if (byDate[dateStr]) {
                    cell.classList.add('has-reservation');
                    monthCount += byDate[dateStr];
                }
            }
            daysGrid.appendChild(cell);
        }
        countNum.textContent = monthCount;
    }

    prevBtn.addEventListener('click', () => {
        current.setMonth(current.getMonth()-1);
        renderCalendar();
    });
    nextBtn.addEventListener('click', () => {
        current.setMonth(current.getMonth()+1);
        renderCalendar();
    });

    renderCalendar();
}

// --------------------------------------------------------
// Modal “Todos os Espaços”
// --------------------------------------------------------
async function openAllSpacesModal() {
    const modal        = document.getElementById('allSpacesModal');
    const activeGrid   = document.getElementById('activeSpacesGrid');
    const inactiveGrid = document.getElementById('inactiveSpacesGrid');

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
                // tooltip no hover
                card.title = s.disableReason || 'Sem motivo informado';
            }
            (s.active ? activeGrid : inactiveGrid).appendChild(card);
        });

        if (!activeGrid.children.length)
            activeGrid.innerHTML = '<p>— nenhum espaço ativo —</p>';
        if (!inactiveGrid.children.length)
            inactiveGrid.innerHTML = '<p>— nenhum espaço inativo —</p>';
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
