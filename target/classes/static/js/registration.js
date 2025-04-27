document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = this.firstName.value.trim();
    const lastName = this.lastName.value.trim();
    const email = this.email.value.trim();
    const password = this.password.value;
    const confirmPassword = this.confirmPassword.value;

    const passwordError = document.getElementById("passwordError");

    if (password !== confirmPassword) {
        passwordError.style.display = "block";
        return;
    } else {
        passwordError.style.display = "none";
    }

    document.getElementById("loader").style.display = "flex";

    const userData = {
        firstName,
        lastName,
        email,
        password
    };

    fetch("http://localhost:8080/api/v1/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    })
        .then(response => {
            document.getElementById("loader").style.display = "none";
            if (!response.ok) {
                throw new Error("Erro ao cadastrar. Verifique os dados ou tente novamente.");
            }
            return response.text();
        })
        .then(data => {
            exibirMensagem("Cadastro realizado com sucesso! Verifique seu e-mail.", "sucesso");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        })
        .catch(error => {
            document.getElementById("loader").style.display = "none";
            exibirMensagem("Erro ao cadastrar: " + error.message, "erro");
        });
});

function exibirMensagem(texto, tipo) {
    const msg = document.getElementById("mensagemCadastro");
    msg.className = "mensagem-cadastro " + tipo;
    msg.innerText = texto;
    msg.style.display = "block";
}
