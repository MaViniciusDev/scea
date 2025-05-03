// auth.js
import { showLoader, hideLoader, showModal } from './ui.js';
import { loginUser } from './api.js';

export async function performLogin(email, password, onSuccess) {
    showLoader();
    try {
        const { authenticated, token, role, message } = await loginUser(email, password);
        if (!authenticated) {
            showModal(message || 'Falha na autenticação.', false);
            return false;
        }
        localStorage.setItem('jwtToken', token);
        onSuccess(role);
        return true;
    } catch (err) {
        showModal('Erro ao fazer login: ' + err.message, false);
        return false;
    } finally {
        hideLoader();
    }
}
