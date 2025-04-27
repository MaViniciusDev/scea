document.addEventListener("DOMContentLoaded", () => {
    const nome = localStorage.getItem("nomeUsuario");
    const elementoNome = document.getElementById("nomeUsuario");

    if (nome && elementoNome) {
        elementoNome.innerText = `Bem-vindo, ${nome}!`;
    }
});

function confirmarLogin() {
    const senha = document.querySelector('input[type="password"]').value;
    const email = localStorage.getItem("emailUsuario");

    if (!senha || !email) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro na requisição");
            return response.json();
        })
        .then(data => {
            if (data.authenticated) {
                alert("Login realizado com sucesso!");

                // ✅ Salva o token JWT no localStorage
                localStorage.setItem("token", data.token);

                // Exemplo opcional: você pode salvar outros dados também
                // localStorage.setItem("userRole", data.role);

                // Redirecionar para dashboard
                 window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Senha incorreta.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao verificar senha.");
        });
}
