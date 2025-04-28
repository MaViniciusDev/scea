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

    /**
     * Registra um novo usuário e gera um token de confirmação.
     * O primeiro usuário salvo recebe ROLE_ADMIN, os demais ROLE_USER.
     */
    public String signUpUser(AppUser appUser) {
        // 1) Verifica se já existe usuário com o mesmo e-mail
        if (appUserRepository.findByEmail(appUser.getEmail()).isPresent()) {
            throw new IllegalStateException("Email já cadastrado");
        }

        // 2) Criptografa a senha
        appUser.setPassword(
                bCryptPasswordEncoder.encode(appUser.getPassword())
        );

        // 3) Define role: primeiro cadastro = ADMIN
        boolean isFirstUser = appUserRepository.count() == 0;
        appUser.setAppUserRole(
                isFirstUser ? AppUserRole.ADMIN : AppUserRole.USER
        );

        // 4) Persiste o usuário
        appUserRepository.save(appUser);

        // 5) Cria e retorna token de confirmação via serviço dedicado
        return confirmationTokenService.createToken(appUser);
    }

    /**
     * Habilita (ativa) um usuário após confirmação do token.
     */
    public int enableAppUser(String email) {
        return appUserRepository.enableAppUser(email);
    }

    /**
     * Busca um usuário por e-mail.
     */
    public Optional<AppUser> findByEmail(String email) {
        return appUserRepository.findByEmail(email);
    }

    /**
     * Verifica existência de usuário por e-mail.
     */
    public boolean existsByEmail(String email) {
        return appUserRepository.findByEmail(email).isPresent();
    }
}
