package com.maviniciusdev.back.appuser;

import com.maviniciusdev.back.registration.token.ConfirmationTokenService;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@AllArgsConstructor
public class AppUserController {

    private final AppUserService           appUserService;
    private final ConfirmationTokenService confirmationTokenService;

    /** DTOs */
    public record UserDto(Long id, String firstName, String lastName, String email, String appUserRole) {}
    public record RoleDto(String role) {}
    public record ProfileDto(String firstName, String lastName) {}

    // 1) Checar existência - PÚBLICO
    @GetMapping("/exists")
    @PermitAll
    public Map<String, Object> checkUser(@RequestParam String email) {
        Map<String, Object> resp = new HashMap<>();
        appUserService.findByEmail(email).ifPresentOrElse(
                u -> {
                    resp.put("exists",    true);
                    resp.put("confirmed", u.isEnabled());
                    resp.put("firstName", u.getFirstName());
                    resp.put("lastName",  u.getLastName());
                },
                () -> {
                    resp.put("exists",    false);
                    resp.put("confirmed", false);
                }
        );
        return resp;
    }

    // 2) Lista todos os usuários - ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getAllUsers() {
        return appUserService.findAll().stream()
                .map(u -> new UserDto(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getAppUserRole().name()
                ))
                .collect(Collectors.toList());
    }

    // 3) Exclui usuário - ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        appUserService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // 4) Altera role de usuário - ADMIN
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateRole(
            @PathVariable Long id,
            @RequestBody RoleDto dto
    ) {
        var u = appUserService.updateRole(id, dto.role());
        return new UserDto(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                u.getAppUserRole().name()
        );
    }

    // 5) Atualiza o próprio nome de perfil - USER ou ADMIN
    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> updateProfile(
            @RequestBody ProfileDto dto,
            Authentication auth
    ) {
        String email = auth.getName();
        appUserService.updateName(email, dto.firstName(), dto.lastName());
        return ResponseEntity.ok().build();
    }
}
