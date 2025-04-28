package com.maviniciusdev.back.registration;


import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.appuser.AppUserRole;
import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.email.EmailSender;
import com.maviniciusdev.back.registration.token.ConfirmationToken;
import com.maviniciusdev.back.registration.token.ConfirmationTokenService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class RegistrationService {

    private final AppUserService appUserService;
    private final EmailValidator emailValidator;
    private final ConfirmationTokenService confirmationTokenService;
    private final EmailSender emailSender;

    public String register(RegistrationRequest request) {
        boolean isValidEmail = emailValidator
                .test(request.getEmail());
        if (!isValidEmail) {
            throw new IllegalStateException("Email não válido");
        }
        String token = appUserService.signUpUser(
                new AppUser(
                        request.getFirstName(),
                        request.getLastName(),
                        request.getEmail(),
                        request.getPassword(),
                        AppUserRole.USER

                )
        );
        String link = "http://localhost:8080/api/v1/registration/confirm?token=" + token;
        emailSender.send(request.getEmail(), buildEmail(request.getEmail(), link));
        return token;

    }

    @Transactional
    public String confirmToken(String token) {
        ConfirmationToken confirmationToken = confirmationTokenService
                .getToken(token)
                .orElseThrow(() ->
                        new IllegalStateException("token não encontrado"));

        if (confirmationToken.getConfirmedAt() != null) {
            throw new IllegalStateException("email já confirmado");
        }

        LocalDateTime expiredAt = confirmationToken.getExpiresAt();

        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("token expirado");
        }

        confirmationTokenService.setConfirmedAt(token);
        appUserService.enableAppUser(
                confirmationToken.getAppUser().getEmail());
        return buildConfirmationPage();
    }

    private String buildConfirmationPage() {
        return "<!DOCTYPE html>" +
                "<html lang=\"pt-BR\">" +
                "<head>" +
                "  <meta charset=\"UTF-8\"/>" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>" +
                "  <title>Conta Ativada</title>" +
                "</head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;font-family:'Ubuntu',sans-serif;\">" +
                "  <table role=\"presentation\" width=\"100%\" " +
                "         style=\"max-width:600px;margin:0 auto;" +
                "                background:#ffffff;border-radius:8px;" +
                "                overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                "    <tr>" +
                "      <td style=\"background:#2d3159;text-align:center;padding:20px;\">" +
                "        <h1 style=\"margin:0;color:#ffffff;font-size:24px;\">" +
                "          ✅ Conta Ativada!</h1>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"padding:30px;text-align:center;\">" +
                "        <p style=\"font-size:16px;color:#333;margin-bottom:20px;\">" +
                "          Sua conta foi confirmada com sucesso.<br/>" +
                "          Agora você já pode fazer login na plataforma." +
                "        </p>" +
                "        <div style=\"text-align:center;margin:40px 0;\">" +
                "          <a href=\"http://localhost:63342/scea/static/pages/index.html\" " +
                "             style=\"background:#a3b2ff;color:#000;" +
                "                    text-decoration:none;padding:12px 24px;" +
                "                    border-radius:6px;font-weight:bold;" +
                "                    font-size:16px;display:inline-block;\">" +
                "            Ir para Login" +
                "          </a>" +
                "        </div>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"background:#f6f6f6;text-align:center;" +
                "                 padding:20px;font-size:14px;color:#999;\">" +
                "        <p style=\"margin:0;\">AEUCSAL &copy; 2025 — Todos os direitos reservados</p>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }



private String buildEmail(String name, String link) {
        return "<!DOCTYPE html>" +
                "<html lang=\"pt-BR\">" +
                "<head>" +
                "  <meta charset=\"UTF-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "  <title>Confirmação de E-mail</title>" +
                "</head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;font-family:'Ubuntu',sans-serif;\">" +
                // Container central
                "  <table role=\"presentation\" width=\"100%\" style=\"max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                // Header com cor de fundo para separar
                "    <tr>" +
                "      <td style=\"background:#2d3159;text-align:center;padding:20px;\">" +
                "        <h1 style=\"margin:0;color:#ffffff;font-size:24px;\">Confirme seu E‑mail</h1>" +
                "      </td>" +
                "    </tr>" +
                // Corpo da mensagem
                "    <tr>" +
                "      <td style=\"padding:30px;\">" +
                "        <p style=\"font-size:16px;color:#333;margin-bottom:20px;\">Olá, <strong>" + name + "</strong></p>" +
                "        <p style=\"font-size:16px;color:#333;margin-bottom:30px;line-height:1.5;\">" +
                "          Obrigado por se cadastrar na nossa plataforma. " +
                "          Para ativar sua conta, clique no botão abaixo. " +
                "          Esse link expira em 15 minutos." +
                "        </p>" +
                // Botão de ação
                "        <div style=\"text-align:center;margin:40px 0;\">" +
                "          <a href=\"" + link + "\"" +
                "             style=\"background:#a3b2ff;color:#000;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:16px;display:inline-block;\">" +
                "            Ativar Agora" +
                "          </a>" +
                "        </div>" +
                "        <p style=\"font-size:14px;color:#666;line-height:1.4;\">" +
                "          Caso o botão não funcione, copie e cole este link no seu navegador:<br>" +
                "          <a href=\"" + link + "\" style=\"color:#2d3159;word-break:break-all;\">" +
                link +
                "          </a>" +
                "        </p>" +
                "      </td>" +
                "    </tr>" +
                // Footer
                "    <tr>" +
                "      <td style=\"background:#f6f6f6;text-align:center;padding:20px;font-size:14px;color:#999;\">" +
                "        <p style=\"margin:0;\">AEUCSAL &copy; 2025 — Todos os direitos reservados</p>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }

}
