package com.maviniciusdev.back.registration.token;

import com.maviniciusdev.back.appuser.AppUser;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ConfirmationTokenService {

    private final ConfirmationTokenRepository confirmationTokenRepository;

    /**
     * Persiste um token já construído.
     */
    public void saveConfirmationToken(ConfirmationToken token) {
        confirmationTokenRepository.save(token);
    }

    /**
     * Busca um token pelo seu valor.
     */
    public Optional<ConfirmationToken> getToken(String token) {
        return confirmationTokenRepository.findByToken(token);
    }

    /**
     * Marca a data de confirmação do token.
     */
    @Transactional
    public int setConfirmedAt(String token) {
        return confirmationTokenRepository.updateConfirmedAt(
                token,
                LocalDateTime.now()
        );
    }

    /**
     * Gera, persiste e retorna um novo token de confirmação para o usuário,
     * válido por 15 minutos. Tokens antigos deste usuário são apagados.
     */
    @Transactional
    public String createToken(AppUser user) {
        // remove tokens antigos (opcional, para não acumular)
        confirmationTokenRepository.deleteByAppUser(user);

        String token = UUID.randomUUID().toString();
        ConfirmationToken confirmationToken = new ConfirmationToken(
                token,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(15),
                user
        );
        confirmationTokenRepository.save(confirmationToken);
        return token;
    }
}
