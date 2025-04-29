// api.js

// Base URL do backend
const API_BASE = 'http://localhost:8080/api/v1';

/**
 * Verifica se já existe usuário com esse e-mail.
 * GET /api/v1/users/exists?email=...
 */
async function checkUserExists(email) {
    const resp = await fetch(`${API_BASE}/users/exists?email=${encodeURIComponent(email)}`);
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json(); // { exists, confirmed, firstName, lastName }
}

/**
 * Efetua login do usuário.
 * POST /api/v1/auth/login
 */
async function loginUser(email, senha) {
    const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json(); // { authenticated, token, firstName, lastName, message? }
}

/**
 * Cadastra novo usuário.
 * POST /api/v1/registration
 */
async function registerUser(data) {
    const resp = await fetch(`${API_BASE}/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.text(); // token retornado (não usado no front)
}

/**
 * Reenvia e-mail de confirmação para um usuário cujo token expirou.
 * POST /api/v1/registration/resend
 */
async function resendConfirmationEmail(email) {
    const resp = await fetch(`${API_BASE}/registration/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.text();
}
