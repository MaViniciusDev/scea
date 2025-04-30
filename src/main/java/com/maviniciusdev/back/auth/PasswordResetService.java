package com.maviniciusdev.back.auth;

import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.email.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final AppUserService             appUserService;
    private final EmailService               emailService;

    @Value("${app.password.reset.token.expiration.minutes:60}")
    private long expirationMinutes;

    // Endpoint de confirmação pelo back-end
    private static final String CONFIRM_RESET_ENDPOINT =
            "http://localhost:8080/api/v1/auth/confirm-reset";

    @Transactional
    public void createResetToken(String email) {
        AppUser user = appUserService.loadUserByEmail(email);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(expirationMinutes);

        PasswordResetToken token = new PasswordResetToken(user, expiresAt);
        tokenRepository.save(token);

        // Link para confirmação no back-end, que vai redirecionar ao front-end
        String link = CONFIRM_RESET_ENDPOINT + "?token=" + token.getToken();
        emailService.send(user.getEmail(), buildEmail(link));
    }

    @Transactional
    public void resetPassword(String tokenStr, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        appUserService.updatePassword(token.getUser().getEmail(), newPassword);
        tokenRepository.deleteByToken(tokenStr);
    }

    private String buildEmail(String link) {
        return "<!DOCTYPE html>" +
                "<html lang=\"pt-BR\">" +
                "<head><meta charset=\"UTF-8\"/>" +
                "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>" +
                "<title>Redefinir Senha</title></head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;" +
                "font-family:'Ubuntu',sans-serif;\">" +
                "  <table role=\"presentation\" width=\"100%\" " +
                "style=\"max-width:600px;margin:0 auto;" +
                "background:#ffffff;border-radius:8px;overflow:hidden;" +
                "box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                "    <tr>" +
                "      <td style=\"background:#2d3159;text-align:center;" +
                "padding:20px;\">" +
                "        <h1 style=\"margin:0;color:#ffffff;" +
                "font-size:24px;\">Redefinir Senha</h1>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"padding:30px;text-align:center;\">" +
                "        <p style=\"font-size:16px;color:#333;" +
                "line-height:1.5;\">" +
                "Clique no botão abaixo para confirmar o pedido de redefinição de senha. Este link expira em "
                + expirationMinutes + " minutos." +
                "        </p>" +
                "        <div style=\"margin-top:30px;\">" +
                "          <a href=\"" + link + "\" " +
                "style=\"background:#a3b2ff;color:#000;" +
                "text-decoration:none;padding:12px 24px;border-radius:6px;" +
                "font-weight:bold;font-size:16px;display:inline-block;\">" +
                "Confirmar Redefinição" +
                "          </a>" +
                "        </div>" +
                "      </td>" +
                "    </tr>" +
                "    <tr>" +
                "      <td style=\"background:#f6f6f6;" +
                "text-align:center;padding:20px;font-size:14px;color:#999;\">" +
                "        <p style=\"margin:0;\">AEUCSAL &copy; 2025 — Todos os direitos reservados</p>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }
}
