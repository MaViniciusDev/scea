function searchEmail() {
    const email = document.querySelector('input[type="email"]').value.trim();

    if (!email) {
        alert("Por favor, insira um e-mail institucional.");
        return;
    }

    fetch(`http://localhost:8080/api/v1/users/exists?email=${encodeURIComponent(email)}`)
        .then(response => {
            if (!response.ok) throw new Error("Erro na requisição");
            return response.json();
        })
        .then(data => {
            if (!data.exists) {
                alert("E-mail não cadastrado!");
            } else if (!data.confirmed) {
                alert("Este e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
            } else {
                // Salva e-mail e nome completo
                localStorage.setItem("emailUsuario", email);
                const nomeCompleto = `${data.firstName} ${data.lastName}`;
                localStorage.setItem("nomeUsuario", nomeCompleto);

                window.location.href = "password.html";
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao verificar o e-mail.");
        });
}

function fazerLogin() {
    searchEmail();
}
