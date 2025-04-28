package com.maviniciusdev.back.auth;

import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserService appUserService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

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
                response.put("message", !user.isEnabled() ?
                        "Conta ainda não confirmada." : "Senha incorreta.");
            }

        } else {
            response.put("authenticated", false);
            response.put("message", "Usuário não encontrado.");
        }

        return response;
    }
}
