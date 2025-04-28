/**
 * api.js
 * Centraliza todas as chamadas HTTP.
 */

const API_BASE = 'http://localhost:8080/api/v1';

async function checkUserExists(email) {
    const resp = await fetch(`${API_BASE}/users/exists?email=${encodeURIComponent(email)}`);
    if (!resp.ok) throw new Error(`Erro ao verificar usuário: ${resp.statusText}`);
    return resp.json();
}

async function loginUser(email, password) {
    const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password })
    });
    if (!resp.ok) throw new Error(`Erro ao efetuar login: ${resp.statusText}`);
    return resp.json();
}

async function registerUser(data) {
    const resp = await fetch(`${API_BASE}/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.text();
}

async function confirmEmail(token) {
    const resp = await fetch(`${API_BASE}/registration/confirm?token=${encodeURIComponent(token)}`);
    if (!resp.ok) throw new Error(await resp.text());
    return resp.text();
}

async function createReservation(reservation) {
    const resp = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json();
}

async function deleteReservation(id) {
    const resp = await fetch(`${API_BASE}/reservations/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.text();
}

async function createSpace(space) {
    const resp = await fetch(`${API_BASE}/academic-spaces/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(space)
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json();
}

async function updateSpace(id, space) {
    const resp = await fetch(`${API_BASE}/academic-spaces/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(space)
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json();
}

async function getActiveSpaces() {
    const resp = await fetch(`${API_BASE}/academic-spaces/active`);
    if (!resp.ok) throw new Error(`Erro ao buscar espaços ativos: ${resp.statusText}`);
    return resp.json();
}

async function updateAvailability(id, active) {
    const resp = await fetch(`${API_BASE}/academic-spaces/update-availability/${id}?active=${active}`, { method: 'PUT' });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json();
}
