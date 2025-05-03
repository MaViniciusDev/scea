//validação de formulários

// valida e-mail
export function isEmailValid(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// valida força da senha
export function isPasswordStrong(password) {
    return typeof password === 'string' && password.length >= 6;
}

// valida cadastro completo
export function validateRegistration(data) {
    const errors = {};
    if (!data.firstName || data.firstName.trim() === '') {
        errors.firstName = 'Digite seu nome.';
    }
    if (!data.lastName || data.lastName.trim() === '') {
        errors.lastName = 'Digite seu sobrenome.';
    }
    if (!isEmailValid(data.email)) {
        errors.email = 'E-mail inválido.';
    }
    if (!isPasswordStrong(data.password)) {
        errors.password = 'Senha deve ter ao menos 6 caracteres.';
    }
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem.';
    }
    return errors;
}
