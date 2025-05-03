package com.maviniciusdev.back.registration;

import com.maviniciusdev.back.registration.token.ConfirmationToken;
import com.maviniciusdev.back.registration.token.ConfirmationTokenService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/registration")
@AllArgsConstructor
public class RegistrationController {

    private static final String LOGIN_URL = "http://localhost:63342/scea/static/pages/index.html";

    private final RegistrationService registrationService;
    private final ConfirmationTokenService confirmationTokenService;

    @PostMapping
    public String register(@RequestBody RegistrationRequest request) {
        return registrationService.register(request);
    }

    @PostMapping("/resend")
    public String resend(@RequestBody ResendRequest body) {
        return registrationService.resendToken(body.getEmail());
    }

    @GetMapping(path = "confirm", produces = MediaType.TEXT_HTML_VALUE)
    public String confirm(@RequestParam("token") String token) {
        Optional<ConfirmationToken> tokOpt = confirmationTokenService.getToken(token);
        if (tokOpt.isEmpty()) {
            return buildSimplePage(
                    "Falha na Confirmação",
                    "❌ Link de confirmação inválido.",
                    "Voltar ao Login",
                    LOGIN_URL
            );
        }

        ConfirmationToken ct = tokOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (ct.getConfirmedAt() != null) {
            return buildSimplePage(
                    "Conta Já Ativada",
                    "✅ Este e-mail já foi confirmado anteriormente.",
                    "Ir para Login",
                    LOGIN_URL
            );
        }

        if (ct.getExpiresAt().isBefore(now)) {
            String email = ct.getAppUser().getEmail();
            return buildExpiredPage(email);
        }

        // sucesso!
        registrationService.confirmToken(token);
        return buildSimplePage(
                "Conta Confirmada",
                "✅ Seu e-mail foi ativado com sucesso! Agora você pode fazer login.",
                "Ir para Login",
                LOGIN_URL
        );
    }

    private String buildSimplePage(
            String title,
            String message,
            String buttonText,
            String buttonHref
    ) {
        return "<!DOCTYPE html>" +
                "<html lang=\"pt-BR\">" +
                "<head><meta charset=\"UTF-8\"/>" +
                "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>" +
                "<title>" + title + "</title></head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;"
                + "font-family:'Ubuntu',sans-serif;\">" +
                "  <table role=\"presentation\" width=\"100%\" "
                + "style=\"max-width:600px;margin:0 auto;"
                + "background:#ffffff;border-radius:8px;overflow:hidden;"
                + "box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                "    <tr>" +
                "      <td style=\"background:#2d3159;"
                + "text-align:center;padding:20px;\">" +
                "        <h1 style=\"margin:0;color:#ffffff;"
                + "font-size:24px;\">" + title + "</h1>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"padding:30px;text-align:center;\">" +
                "        <p style=\"font-size:16px;color:#333;"
                + "line-height:1.5;\">" + message + "</p>" +
                "        <div style=\"margin-top:30px;\">" +
                "          <a href=\"" + buttonHref + "\" "
                + "style=\"background:#a3b2ff;color:#000;"
                + "text-decoration:none;padding:12px 24px;border-radius:6px;"
                + "font-weight:bold;font-size:16px;display:inline-block;\">" +
                buttonText +
                "          </a>" +
                "        </div>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"background:#f6f6f6;text-align:center;"
                + "padding:20px;font-size:14px;color:#999;\">" +
                "        <p style=\"margin:0;\">AEUCSAL &copy; 2025 — Todos os direitos reservados</p>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }

    private String buildExpiredPage(String email) {
        return "<!DOCTYPE html>" +
                "<html lang=\"pt-BR\">" +
                "<head><meta charset=\"UTF-8\"/>" +
                "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>" +
                "<title>Link Expirado</title></head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;"
                + "font-family:'Ubuntu',sans-serif;\">" +
                "  <table role=\"presentation\" width=\"100%\" "
                + "style=\"max-width:600px;margin:0 auto;"
                + "background:#ffffff;border-radius:8px;overflow:hidden;"
                + "box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                "    <tr>" +
                "      <td style=\"background:#F44336;"
                + "text-align:center;padding:20px;\">" +
                "        <h1 style=\"margin:0;color:#ffffff;"
                + "font-size:24px;\">❌ Link Expirado</h1>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"padding:30px;text-align:center;\">" +
                "        <p style=\"font-size:16px;color:#333;"
                + "line-height:1.5;\">"
                + "Seu link de confirmação expirou após 15 minutos.<br/>"
                + "Deseja reenviar o e-mail de ativação?"
                + "        </p>" +
                "        <div style=\"margin-top:30px;\">" +
                "          <form action=\"/api/v1/registration/resend\" "
                + "method=\"post\" style=\"display:inline-block;\">" +
                "            <input type=\"hidden\" name=\"email\" "
                + "value=\"" + email + "\"/>" +
                "            <button type=\"submit\" "
                + "style=\"background:#a3b2ff;color:#000;"
                + "padding:12px 24px;border-radius:6px;"
                + "font-weight:bold;font-size:16px;border:none;cursor:pointer;\">" +
                "              Reenviar e-mail" +
                "            </button>" +
                "          </form>" +
                "          <a href=\"" + LOGIN_URL + "\" "
                + "style=\"background:#f6f6f6;color:#333;"
                + "text-decoration:none;padding:12px 24px;"
                + "border-radius:6px;font-weight:bold;"
                + "font-size:16px;display:inline-block;margin-left:12px;\">" +
                "            Voltar ao Login" +
                "          </a>" +
                "        </div>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"background:#f6f6f6;text-align:center;"
                + "padding:20px;font-size:14px;color:#999;\">" +
                "        <p style=\"margin:0;\">AEUCSAL &copy; 2025 — Todos os direitos reservados</p>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }

    @Setter
    @Getter
    public static class ResendRequest {
        private String email;

    }
}
