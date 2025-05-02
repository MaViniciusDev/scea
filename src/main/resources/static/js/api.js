// api.js
export const API_BASE = 'http://localhost:8080/api/v1';

async function handleResponse(resp) {
    if (!resp.ok) throw new Error(await resp.text());
    return resp;
}

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

export async function resendConfirmationEmail(email) {
    const resp = await fetch(`${API_BASE}/registration/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    await handleResponse(resp);
    return resp.text();
}

export async function forgotPassword(email) {
    const resp = await fetch(
        `${API_BASE}/auth/forgot-password?email=${encodeURIComponent(email)}`,
        { method: 'POST' }
    );
    await handleResponse(resp);
    return resp.text();
}

export async function resetPassword(token, newPassword) {
    const resp = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    await handleResponse(resp);
    return resp.text();
}

// ===== Espaços Acadêmicos =====

/** Busca espaços ativos. */
export async function getActiveSpaces(token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

/** Busca próximas reservas do usuário. */
export async function getNextReservations(token) {
    const resp = await fetch(`${API_BASE}/reservations/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

/** Cria um novo espaço acadêmico. */
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

/** Exclui um espaço por ID. */
export async function deleteSpaceById(id, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/delete/${id}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${token}`}
    });
    await handleResponse(resp);
}