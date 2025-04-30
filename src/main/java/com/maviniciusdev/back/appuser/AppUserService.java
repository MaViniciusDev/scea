package com.maviniciusdev.back.appuser;

import com.maviniciusdev.back.registration.token.ConfirmationTokenService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AppUserService implements UserDetailsService {

    private static final String USER_NOT_FOUND_MSG =
            "Usuário com email %s não encontrado";

    private final AppUserRepository appUserRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final ConfirmationTokenService confirmationTokenService;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                String.format(USER_NOT_FOUND_MSG, email)
                        )
                );
    }


     //Busca um usuário por e-mail.

    public Optional<AppUser> findByEmail(String email) {
        return appUserRepository.findByEmail(email);
    }

    /**
     * Verifica existência de usuário por e-mail.
     */
    public boolean existsByEmail(String email) {
        return appUserRepository.findByEmail(email).isPresent();
    }

    /**
     * Registra um novo usuário e gera um token de confirmação.
     */
    public String signUpUser(AppUser appUser) {
        if (existsByEmail(appUser.getEmail())) {
            throw new IllegalStateException("Email já cadastrado");
        }

        appUser.setPassword(
                bCryptPasswordEncoder.encode(appUser.getPassword())
        );

        boolean isFirstUser = appUserRepository.count() == 0;
        appUser.setAppUserRole(
                isFirstUser ? AppUserRole.ADMIN : AppUserRole.USER
        );

        appUserRepository.save(appUser);
        return confirmationTokenService.createToken(appUser);
    }

    /**
     * Habilita (ativa) um usuário após confirmação do token.
     */
    public int enableAppUser(String email) {
        return appUserRepository.enableAppUser(email);
    }

    /**
     * Carrega a entidade AppUser por e-mail (usado no fluxo de reset de senha).
     */
    public AppUser loadUserByEmail(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                String.format(USER_NOT_FOUND_MSG, email)
                        )
                );
    }

    /**
     * Atualiza a senha de um usuário (usado no fluxo de reset de senha).
     */
    public void updatePassword(String email, String rawNewPassword) {
        AppUser user = loadUserByEmail(email);
        user.setPassword(bCryptPasswordEncoder.encode(rawNewPassword));
        appUserRepository.save(user);
    }
}