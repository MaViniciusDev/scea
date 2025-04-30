// dashboard.js
// Dependências:
//  - api.js → const API_BASE
//  - ui.js  → showLoader, hideLoader, exibirModalMensagem

document.addEventListener('DOMContentLoaded', () => {
    // 1) Dados do usuário
    const firstName = localStorage.getItem('firstName') || '';
    const lastName  = localStorage.getItem('lastName')  || '';
    const role      = localStorage.getItem('role')      || '';

    // 2) Monta menu
    const menuItems = document.getElementById('menuItems');
    const links = (role === 'ADMIN')
        ? [
            { text: 'Dashboard',     href: 'dashboard.html' },
            { text: 'Reservas',      href: 'reservas.html'  },
            { text: 'Espaços Acad.', href: 'spaces-admin.html' },
            { text: 'Professores',   href: 'professores.html'  },
            { text: 'Configurações', href: 'config.html' }
        ]
        : [
            { text: 'Início',        href: 'dashboard.html'       },
            { text: 'Reservas',      href: 'reservation-user.html' },
            { text: 'Configurações', href: 'config.html'          }
        ];
    menuItems.innerHTML = links.map(li => `<li><a href="${li.href}">${li.text}</a></li>`).join('');

    // 3) Logout
    document.getElementById('logoutLink').addEventListener('click', e => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // 4) Exibe nome no menu
    const userInfo = document.getElementById('userInfo');
    userInfo.textContent = (role === 'ADMIN')
        ? `${firstName} ADMIN`
        : `${firstName} ${lastName}`;

    // 5) Carrega dados
    loadNextReservations();
    loadCalendar();
    loadTopSpaces();

    // 6) Botão Ver todos
    document.getElementById('viewAllSpaces').addEventListener('click', () => {
        window.location.href = (role === 'ADMIN')
            ? 'spaces-admin.html'
            : 'spaces-user.html';
    });
});

async function loadNextReservations() {
    const container = document.getElementById('nextReservations');
    container.innerHTML = '';
    showLoader();
    try {
        const res = await fetch(`${API_BASE}/reservations/user`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        if (!res.ok) throw new Error('Erro ao buscar reservas');
        const reservas = await res.json();
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
                    <div class="reserva-horario">${r.reservationInit.slice(0,5)} - ${r.reservationEnd.slice(0,5)}</div>
                `;
                container.appendChild(card);
            });
        }
    } catch (e) {
        exibirModalMensagem('Erro ao carregar reservas', false);
    } finally {
        hideLoader();
    }
}

async function loadTopSpaces() {
    const list = document.getElementById('topSpacesList');
    list.innerHTML = '';
    showLoader();
    try {
        const res = await fetch(`${API_BASE}/academic-spaces/available`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        if (!res.ok) throw new Error('Erro ao buscar espaços');
        const text = await res.text();
        const spaces = text ? JSON.parse(text) : [];
        spaces
            .sort((a, b) => (b.reservationsCount || 0) - (a.reservationsCount || 0))
            .slice(0, 6)
            .forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="space-detail.html?id=${s.id}">${s.name}</a>`;
                list.appendChild(li);
            });
    } catch (e) {
        console.error(e);
        exibirModalMensagem('Não foi possível carregar espaços', false);
    } finally {
        hideLoader();
    }
}

function loadCalendar() {
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '<p>Calendário será implementado aqui.</p>';
}
