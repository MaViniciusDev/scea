// manage-reservations.js
import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import { getAllSpaces, getReservationsBySpace, deleteReservation } from './api.js';

let spaces = [];
let currentSpace = { id: null, name: '', element: null };

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    loadSpaces();
    document.getElementById('searchSpace')
        ?.addEventListener('input', filterSpaces);
});

async function loadSpaces() {
    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        spaces = await getAllSpaces(token);
        renderSpaces(spaces);
    } catch (err) {
        showModal('Erro ao carregar salas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

function renderSpaces(list) {
    const ul = document.getElementById('spacesList');
    ul.innerHTML = '';
    if (!list.length) {
        ul.innerHTML = '<li>Nenhuma sala disponível.</li>';
        return;
    }
    list.forEach(space => {
        const li = document.createElement('li');
        li.textContent = space.name;
        li.addEventListener('click', () => selectSpace(space, li));
        ul.appendChild(li);
    });
}

function filterSpaces() {
    const term = document
        .getElementById('searchSpace')
        .value.trim()
        .toLowerCase();
    renderSpaces(
        spaces.filter(s => s.name.toLowerCase().includes(term))
    );
}

async function selectSpace(space, liElement) {
    // marcar visualmente
    document.querySelectorAll('#spacesList li')
        .forEach(li => li.classList.remove('selected'));
    liElement.classList.add('selected');

    // guardar estado e atualizar título
    currentSpace = { id: space.id, name: space.name, element: liElement };
    document.getElementById('detailTitle').textContent = `Reservas em ${space.name}`;

    // buscar e renderizar reservas
    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        const reservas = await getReservationsBySpace(space.id, token);
        renderReservations(reservas);
    } catch (err) {
        showModal('Erro ao carregar reservas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

function renderReservations(reservas) {
    const container = document.getElementById('reservationsList');
    const tpl = document.getElementById('reservationCardTemplate');
    container.innerHTML = '';

    if (!reservas.length) {
        container.innerHTML = '<p>Ainda não há reservas feitas nesse espaço.</p>';
        return;
    }

    reservas
        .sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate))
        .forEach(r => {
            const clone = tpl.content.cloneNode(true);

            clone.querySelector('.reserva-usuario').textContent =
                `${r.professor.firstName} ${r.professor.lastName}`;
            clone.querySelector('.reserva-solicited').textContent =
                `Solicitado ${new Date(r.createdAt).toLocaleString()}`;
            const typeCheckbox = clone.querySelector('.reserva-type');
            typeCheckbox.checked = (r.type === 'AULA');
            clone.querySelector('.reserva-data').textContent =
                `Data: ${new Date(r.reservationDate).toLocaleDateString()}`;
            clone.querySelector('.reserva-horario').textContent =
                `Horário: ${r.reservationInit.slice(0,5)} às ${r.reservationEnd.slice(0,5)}`;

            const obsEl = clone.querySelector('.reserva-observations');
            if (r.observations) {
                obsEl.textContent = `Observações: ${r.observations}`;
            } else {
                obsEl.remove();
            }

            clone.querySelector('.btn-delete').addEventListener('click', async () => {
                if (!confirm('Confirma exclusão desta reserva?')) return;
                showLoader();
                try {
                    const token = localStorage.getItem('jwtToken');
                    await deleteReservation(r.id, token);
                    showToast('Reserva excluída com sucesso!');
                    // recarrega reservas para a sala atual
                    selectSpace(currentSpace, currentSpace.element);
                } catch (err) {
                    showModal('Erro ao excluir reserva: ' + err.message, false);
                } finally {
                    hideLoader();
                }
            });

            container.appendChild(clone);
        });
}
