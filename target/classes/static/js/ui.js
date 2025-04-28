/**
 * ui.js
 * Funções auxiliares de interface: exibir erros, modais e loader.
 */

/**
 * Mostra o loader global.
 */
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
}

/**
 * Esconde o loader global.
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
}

/**
 * Exibe mensagem de erro abaixo do campo identificado por fieldId.
 */
function showFieldError(fieldId, msg) {
    const el = document.getElementById(`error-${fieldId}`);
    if (el) el.innerText = msg;
}

/**
 * Limpa todas as mensagens de erro de um form.
 */
function clearFieldErrors(formId) {
    document
        .querySelectorAll(`#${formId} .error-message`)
        .forEach(el => (el.innerText = ''));
}

/**
 * Exibe um modal com a mensagem.
 * Se isSuccess for true, exibe botão para retornar ao login.
 */
function showModal(message, isSuccess) {
    const overlay = document.getElementById('modalOverlay');
    const msgEl   = document.getElementById('modalMessage');
    const btn     = document.getElementById('modalButton');

    if (!overlay || !msgEl || !btn) {
        alert(message);
        return;
    }

    msgEl.innerText = message;
    btn.innerText   = isSuccess ? 'Ir para login' : 'OK';

    overlay.classList.remove('hidden');

    btn.onclick = () => {
        overlay.classList.add('hidden');
        if (isSuccess) {
            // redireciona usuário à página de login
            window.location.href = 'index.html';
        }
    };
}