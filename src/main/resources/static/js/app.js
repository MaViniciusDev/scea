// Interceptador global e exibição de toasts pendentes

import { showToast } from './ui.js';

// --- Interceptador fetch para capturar 401 (token expirado) ---
(function() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            if (response.status === 401) {
                sessionStorage.setItem(
                    'toastMessage',
                    'Seu token expirou. Faça login novamente.'
                );
                const isAuthPage = window.location.pathname.endsWith('index.html')
                    || window.location.pathname.endsWith('login.html');
                if (!isAuthPage) {
                    window.location.href = 'index.html';
                }
                return Promise.reject(new Error('Token expirado'));
            }
            return response;
        } catch (err) {
            return Promise.reject(err);
        }
    };
})();

// --- DOMContentLoaded: exibe toast pendente ---
document.addEventListener('DOMContentLoaded', () => {
    const pendingToast = sessionStorage.getItem('toastMessage');
    if (pendingToast) {
        showToast(pendingToast);
        sessionStorage.removeItem('toastMessage');
    }
});
