package com.maviniciusdev.back.auth;

import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.security.jwt.JwtService;
import com.maviniciusdev.back.auth.PasswordResetService;
import com.maviniciusdev.back.auth.PasswordResetToken;
import com.maviniciusdev.back.auth.PasswordResetTokenRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
public class AuthController {

    private final AppUserService appUserService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;
    private final PasswordResetTokenRepository tokenRepository;

    private static final String FRONT_LOGIN_URL =
            "http://localhost:63342/scea/static/pages/index.html";
    private static final String FRONT_RESET_PAGE =
            "http://localhost:63342/scea/static/pages/reset-password.html";

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String senha = loginRequest.get("senha");
        Map<String, Object> response = new HashMap<>();
        Optional<AppUser> userOpt = appUserService.findByEmail(email);

        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            boolean senhaCorreta = passwordEncoder.matches(senha, user.getPassword());
            if (senhaCorreta && user.isEnabled()) {
                String token = jwtService.generateToken(user.getEmail());
                response.put("authenticated", true);
                response.put("token", token);
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                response.put("role", user.getAppUserRole().name());
            } else {
                response.put("authenticated", false);
                response.put("message", !user.isEnabled()
                        ? "Conta ainda não confirmada."
                        : "Senha incorreta.");
            }
        } else {
            response.put("authenticated", false);
            response.put("message", "Usuário não encontrado.");
        }
        return response;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        passwordResetService.createResetToken(email);
        return ResponseEntity.ok(
                "Se um usuário com esse e-mail existir, você receberá em breve um link para redefinir a senha."
        );
    }

    @GetMapping(path = "/confirm-reset", produces = MediaType.TEXT_HTML_VALUE)
    public String confirmReset(@RequestParam("token") String token) {
        Optional<PasswordResetToken> tokOpt = tokenRepository.findByToken(token);
        if (tokOpt.isEmpty()) {
            return buildSimplePage(
                    "Falha na Redefinição",
                    "❌ Token inválido ou expirado.",
                    "Voltar ao Login",
                    FRONT_LOGIN_URL
            );
        }
        PasswordResetToken resetToken = tokOpt.get();
        LocalDateTime now = LocalDateTime.now();
        if (resetToken.getExpiresAt().isBefore(now)) {
            return buildSimplePage(
                    "Link Expirado",
                    "❌ Este link expirou.",
                    "Reenviar E-mail",
                    "/api/v1/auth/forgot-password?email=" + resetToken.getUser().getEmail()
            );
        }
        // Marca token como confirmado
        resetToken.setConfirmedAt(now);
        tokenRepository.save(resetToken);
        // Redireciona para a página de reset no front-end
        return "<script>window.location.replace('" + FRONT_RESET_PAGE + "?token=" + token + "');</script>";
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Senha redefinida com sucesso.");
    }

    @Data
    private static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }

    private String buildSimplePage(
            String title,
            String message,
            String buttonText,
            String buttonHref
    ) {
        return "<!DOCTYPE html><html lang=\"pt-BR\"><head>" +
                "<meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>" +
                "<title>" + title + "</title></head>" +
                "<body style=\"margin:0;padding:0;background:#f2f2f2;font-family:'Ubuntu',sans-serif;\">" +
                "<div style=\"max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;" +
                "box-shadow:0 0 10px rgba(0,0,0,0.1);\">" +
                "<div style=\"background:#2d3159;color:#fff;text-align:center;padding:20px;\">" +
                "<h1 style=\"margin:0;font-size:24px;\">" + title + "</h1></div>" +
                "<div style=\"padding:30px;text-align:center;\">" +
                "<p style=\"font-size:16px;color:#333;line-height:1.5;\">" + message + "</p>" +
                "<a href=\"" + buttonHref + "\" style=\"display:inline-block;margin-top:20px;" +
                "padding:12px 24px;background:#a3b2ff;color:#000;text-decoration:none;" +
                "border-radius:6px;font-weight:bold;\">" + buttonText + "</a></div>" +
                "<div style=\"background:#f6f6f6;color:#999;text-align:center;padding:20px;font-size:14px;\">" +
                "AEUCSAL &copy; 2025 — Todos os direitos reservados</div></div></body></html>";
    }
}
