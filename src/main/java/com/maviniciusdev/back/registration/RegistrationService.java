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

@Service
@AllArgsConstructor
public class RegistrationService {

    private final AppUserService            appUserService;
    private final EmailValidator            emailValidator;
    private final ConfirmationTokenService  confirmationTokenService;
    private final EmailSender               emailSender;

    // Endpoint relativo para confirmação de registro
    private static final String CONFIRM_REGISTRATION_ENDPOINT = "/api/v1/registration/confirm";

    /**
     * Registra um novo usuário, gera um token de confirmação com validade
     * de 15 minutos e dispara o e-mail.
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
                        null // a role é atribuída internamente no signUpUser
                )
        );

        // 3) Monta link e dispara e-mail
        String link = CONFIRM_REGISTRATION_ENDPOINT + "?token=" + token;
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


     //Gera e dispara um novo token de confirmação para o e-mail
     //caso exista o usuário e ele ainda não esteja habilitado.

    public String resendToken(String email) {
        AppUser user = appUserService.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado"));

        if (user.isEnabled()) {
            throw new IllegalStateException("Conta já confirmada");
        }

        // cria novo token (remove antigos internamente)
        String token = confirmationTokenService.createToken(user);
        String link  = CONFIRM_REGISTRATION_ENDPOINT + "?token=" + token;
        emailSender.send(user.getEmail(), buildEmail(user.getFirstName(), link));

        return token;
    }

 //Monta o site de confirmação
    private String buildEmail(String name, String link) {
        return "<!DOCTYPE html>" +
                "<html lang='pt-BR'>" +
                "<head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width,initial-scale=1.0'/>" +
                "<title>Confirmação de E-mail</title></head>" +
                "<body style='margin:0;padding:0;background:#f2f2f2;font-family:Ubuntu,sans-serif;'>" +
                "  <table role='presentation' width='100%' style='max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.1);'>" +
                "    <tr><td style='background:#2d3159;text-align:center;padding:20px;'><h1 style='margin:0;color:#fff;font-size:24px;'>Confirme seu E-mail</h1></td></tr>" +
                "    <tr><td style='padding:30px;'><p style='font-size:16px;color:#333;margin-bottom:20px;'>Olá, <strong>" + name + "</strong></p>" +
                "    <p style='font-size:16px;color:#333;line-height:1.5;margin-bottom:30px;'>Obrig... [retained for brevity]"; // continue HTML
    }
}
