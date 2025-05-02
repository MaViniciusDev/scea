// api.js
export const API_BASE = 'http://localhost:8080/api/v1';

// Trata respostas HTTP
async function handleResponse(resp) {
    if (!resp.ok) throw new Error(await resp.text());
    return resp;
}

// === Autenticação e Usuários ===
/** Verifica existência de usuário por email */
export async function checkUserExists(email) {
    const resp = await fetch(
        `${API_BASE}/users/exists?email=${encodeURIComponent(email)}`
    );
    await handleResponse(resp);
    return resp.json();
}

/** Realiza login */
export async function loginUser(email, senha) {
    const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    await handleResponse(resp);
    return resp.json();
}

/** Registra novo usuário */
export async function registerUser(data) {
    const resp = await fetch(`${API_BASE}/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await handleResponse(resp);
    return resp.text();
}

/** Reenvia email de confirmação */
export async function resendConfirmationEmail(email) {
    const resp = await fetch(`${API_BASE}/registration/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    await handleResponse(resp);
    return resp.text();
}

/** Solicita redefinição de senha */
export async function forgotPassword(email) {
    const resp = await fetch(
        `${API_BASE}/auth/forgot-password?email=${encodeURIComponent(email)}`,
        { method: 'POST' }
    );
    await handleResponse(resp);
    return resp.text();
}

/** Redefine senha */
export async function resetPassword(token, newPassword) {
    const resp = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    await handleResponse(resp);
    return resp.text();
}

// === Espaços Acadêmicos ===
/** Busca espaços ativos */
export async function getActiveSpaces(token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

/** Busca todos os espaços, ativos e inativos */
export async function getAllSpaces(token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

/** Busca próximas reservas do usuário */
export async function getNextReservations(token) {
    const resp = await fetch(`${API_BASE}/reservations/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
    return resp.json();
}

/** Cria novo espaço acadêmico */
export async function createSpace(payload, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/create`, {
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

/** Atualiza espaço existente */
export async function updateSpace(id, payload, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/update/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    await handleResponse(resp);
    return resp.json();
}

/** Exclui espaço por ID */
export async function deleteSpaceById(id, token) {
    const resp = await fetch(`${API_BASE}/academic-spaces/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleResponse(resp);
}
