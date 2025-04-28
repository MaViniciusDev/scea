package com.maviniciusdev.back.registration;

import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.email.EmailSender;
import com.maviniciusdev.back.registration.token.ConfirmationToken;
import com.maviniciusdev.back.registration.token.ConfirmationTokenService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RegistrationService {

    private final AppUserService appUserService;
    private final EmailValidator emailValidator;
    private final ConfirmationTokenService confirmationTokenService;
    private final EmailSender emailSender;

    /**
     * Registra um novo usuário, gera um token de confirmação
     * com validade de 15 minutos e dispara o e-mail.
     */
    public String register(RegistrationRequest request) {
        // 1) Valida formato de e-mail
        if (!emailValidator.test(request.getEmail())) {
            throw new IllegalStateException("Email não válido");
        }

        // 2) Persiste AppUser e obtém token
        String token = appUserService.signUpUser(
                new AppUser(
                        request.getFirstName(),
                        request.getLastName(),
                        request.getEmail(),
                        request.getPassword(),
                        null  // a role é atribuída internamente no signUpUser
                )
        );

        // 3) Monta link e dispara e-mail
        String link = "http://localhost:8080/api/v1/registration/confirm?token=" + token;
        emailSender.send(request.getEmail(), buildEmail(request.getFirstName(), link));

        return token;
    }

    /**
     * Confirma o token de e-mail:
     * - lança IllegalStateException em caso de token inválido, expirado ou já usado.
     * - marca confirmado e habilita o usuário.
     */
    @Transactional
    public void confirmToken(String token) {
        ConfirmationToken ct = confirmationTokenService
                .getToken(token)
                .orElseThrow(() -> new IllegalStateException("Token não encontrado"));

        if (ct.getConfirmedAt() != null) {
            throw new IllegalStateException("Email já confirmado");
        }

        if (ct.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expirado");
        }

        confirmationTokenService.setConfirmedAt(token);
        appUserService.enableAppUser(ct.getAppUser().getEmail());
    }

    /**
     * Gera e dispara um novo token de confirmação para o e-mail
     * caso exista o usuário e ele ainda não esteja habilitado.
     */
    public String resendToken(String email) {
        AppUser user = appUserService.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado"));

        if (user.isEnabled()) {
            throw new IllegalStateException("Conta já confirmada");
        }

        // cria novo token (remove antigos internamente)
        String token = confirmationTokenService.createToken(user);

        String link = "http://localhost:8080/api/v1/registration/confirm?token=" + token;
        emailSender.send(user.getEmail(), buildEmail(user.getFirstName(), link));

        return token;
    }

    /**
     * Monta o HTML do e-mail de confirmação.
     */
    private String buildEmail(String name, String link) {
        return "<!DOCTYPE html>" +
                "<html lang=\"pt-BR\">" +
                "<head>" +
                "  <meta charset=\"UTF-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "  <title>Confirmação de E-mail</title>" +
                "</head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;font-family:'Ubuntu',sans-serif;\">" +
                "  <table role=\"presentation\" width=\"100%\" " +
                "         style=\"max-width:600px;margin:0 auto;background:#ffffff;" +
                "                border-radius:8px;overflow:hidden;" +
                "                box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                "    <tr>" +
                "      <td style=\"background:#2d3159;text-align:center;padding:20px;\">" +
                "        <h1 style=\"margin:0;color:#ffffff;font-size:24px;\">Confirme seu E-mail</h1>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"padding:30px;\">" +
                "        <p style=\"font-size:16px;color:#333;margin-bottom:20px;\">" +
                "          Olá, <strong>" + name + "</strong></p>" +
                "        <p style=\"font-size:16px;color:#333;margin-bottom:30px;line-height:1.5;\">" +
                "          Obrigado por se cadastrar na nossa plataforma. " +
                "          Para ativar sua conta, clique no botão abaixo. " +
                "          Esse link expira em 15 minutos." +
                "        </p>" +
                "        <div style=\"text-align:center;margin:40px 0;\">" +
                "          <a href=\"" + link + "\"" +
                "             style=\"background:#a3b2ff;color:#000;text-decoration:none;" +
                "                    padding:12px 24px;border-radius:6px;" +
                "                    font-weight:bold;font-size:16px;" +
                "                    display:inline-block;\">" +
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
                "    <tr>" +
                "      <td style=\"background:#f6f6f6;text-align:center;padding:20px;" +
                "                 font-size:14px;color:#999;\">" +
                "        <p style=\"margin:0;\">AEUCSAL &copy; 2025 — Todos os direitos reservados</p>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }
}
