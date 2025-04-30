// ui.js
// Só DOM e apresentação: loader, modal, campo, toast e interceptação de fetch.

export function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
}

export function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
}

export function showFieldError(fieldId, msg) {
    const el = document.getElementById(`error-${fieldId}`);
    if (el) el.innerText = msg;
}

export function clearFieldErrors(formId) {
    document
        .querySelectorAll(`#${formId} .error-message`)
        .forEach(el => el.innerText = '');
}

export function showModal(message, isSuccess = true) {
    const overlay = document.getElementById('modalOverlay');
    const msgEl   = document.getElementById('modalMessage');
    const btn     = document.getElementById('modalButton');
    if (!overlay || !msgEl || !btn) {
        alert(message);
        return;
    }
    msgEl.innerText = message;
    btn.innerText = 'OK';
    overlay.classList.remove('hidden');
    btn.onclick = () => {
        overlay.classList.add('hidden');
        if (isSuccess) window.location.href = 'index.html';
    };
}

// Toast simples no canto
export function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        Object.assign(container.style, {
            position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 9999
        });
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.innerText = message;
    Object.assign(toast.style, {
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '0.75rem 1.25rem',
        marginTop: '0.5rem',
        borderRadius: '0.5rem',
        opacity: 0,
        transition: 'opacity 0.3s'
    });
    container.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

// Intercepta todos os fetches para 401
(function() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const res = await originalFetch(...args);
            if (res.status === 401) {
                sessionStorage.setItem(
                    'toastMessage',
                    'Seu token expirou. Faça login novamente.'
                );
                window.location.href = 'index.html';
                return Promise.reject(new Error('Token expirado'));
            }
            return res;
        } catch (e) {
            return Promise.reject(e);
        }
    };
})();
