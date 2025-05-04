import { initSidebar } from './dashboard.js';
import { showLoader, hideLoader, showModal, showToast } from './ui.js';
import { getUserReservations, deleteReservation } from './api.js';

let reservations = [];

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    loadMyReservations();
});

async function loadMyReservations() {
    showLoader();
    try {
        const token = localStorage.getItem('jwtToken');
        reservations = await getUserReservations(token);
        renderReservations(reservations);
    } catch (err) {
        showModal('Erro ao carregar suas reservas: ' + err.message, false);
    } finally {
        hideLoader();
    }
}

function renderReservations(list) {
    const container = document.getElementById('reservationsList');
    const tpl = document.getElementById('reservationCardTemplate');
    container.innerHTML = '';

    if (!list.length) {
        container.innerHTML = '<p>Você não tem reservas.</p>';
        return;
    }

    list
        .sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate))
        .forEach(r => {
            const clone = tpl.content.cloneNode(true);

            // Espaço
            clone.querySelector('.reserva-espaco').textContent = r.academicSpaces.name;
            // Solicitação
            clone.querySelector('.reserva-solicited').textContent =
                `Solicitado ${new Date(r.createdAt).toLocaleString()}`;
            // Tipo
            clone.querySelector('.reserva-type').checked = (r.type === 'AULA');
            // Data e horário
            clone.querySelector('.reserva-data').textContent =
                `Data: ${new Date(r.reservationDate).toLocaleDateString()}`;
            clone.querySelector('.reserva-horario').textContent =
                `Horário: ${r.reservationInit.slice(0,5)} - ${r.reservationEnd.slice(0,5)}`;
            // Observações (se houver)
            const obsEl = clone.querySelector('.reserva-observations');
            if (r.observations) {
                obsEl.textContent = `Observações: ${r.observations}`;
            } else {
                obsEl.remove();
            }

            // Botão de cancelar
            clone.querySelector('.btn-delete').addEventListener('click', async () => {
                if (!confirm('Deseja cancelar esta reserva?')) return;
                showLoader();
                try {
                    const token = localStorage.getItem('jwtToken');
                    await deleteReservation(r.id, token);
                    showToast('Reserva cancelada com sucesso!');
                    // recarrega a lista após exclusão
                    loadMyReservations();
                } catch (err) {
                    showModal('Erro ao cancelar reserva: ' + err.message, false);
                } finally {
                    hideLoader();
                }
            });

            container.appendChild(clone);
        });
}
