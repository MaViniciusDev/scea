export const API_BASE = 'http://localhost:8080/api/v1';

// Trata respostas HTTP (apenas lança erro, sem side-effects de autenticação)
async function handleResponse(resp) {
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    return resp;
}

// === Autenticação e Usuários ===
export async function checkUserExists(email) {
    const resp = await fetch(
        `${API_BASE}/users/exists?email=${encodeURIComponent(email)}`
    );
    await handleResponse(resp);
    return resp.json();
}

export async function loginUser(email, senha) {
    const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    await handleResponse(resp);
    return resp.json();
}

export async function registerUser(data) {
    const resp = await fetch(`${API_BASE}/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await handleResponse(resp);
    return resp.text();
}

// === Espaços Acadêmicos ===
export async function getActiveSpaces(token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

/** Busca todos os espaços (ativos e inativos) via /all */
export async function getAllSpaces(token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

export async function createSpace(payload, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  'application/json'
        },
        body: JSON.stringify(payload)
    });
    await handleResponse(resp);
    return resp.json();
}

export async function updateSpace(id, payload, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/update/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  'application/json'
        },
        body: JSON.stringify(payload)
    });
    await handleResponse(resp);
    return resp.json();
}

export async function deleteSpaceById(id, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
}

// === Reservas ===
export async function getNextReservations(token) {
    const resp = await fetch(`${API_BASE}/reservations/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

export async function getUserReservations(token) {
    const resp = await fetch(`${API_BASE}/reservations/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

export async function createReservation(payload, token) {
    const resp = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    await handleResponse(resp);
    return resp.json();
}

export async function getReservationsBySpace(spaceId, token) {
    const resp = await fetch(
        `${API_BASE}/reservations/space/${encodeURIComponent(spaceId)}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    await handleResponse(resp);
    return resp.json();
}

export async function deleteReservation(reservationId, token) {
    const resp = await fetch(
        `${API_BASE}/reservations/${encodeURIComponent(reservationId)}`,
        {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    await handleResponse(resp);
    return resp.text();
}

// === Professores / Usuários ===
export async function getAllProfessors(token) {
    const resp = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

export async function deleteProfessor(userId, token) {
    const resp = await fetch(
        `${API_BASE}/users/${encodeURIComponent(userId)}`,
        {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    await handleResponse(resp);
    return resp.text();
}

export async function updateUserRole(userId, newRole, token) {
    const resp = await fetch(
        `${API_BASE}/users/${encodeURIComponent(userId)}/role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        }
    );
    await handleResponse(resp);
    return resp.json();
}

export async function promoteProfessor(userId, token) {
    return updateUserRole(userId, 'ADMIN', token);
}
//Atualiza nome e sobrenome do usuário logado
export async function updateUserProfile(data, token) {
    const resp = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  'application/json'
        },
        body: JSON.stringify(data)
    });
    await handleResponse(resp);
    return resp.json();
}
