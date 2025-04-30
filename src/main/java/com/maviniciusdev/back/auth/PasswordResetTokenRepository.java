// src/main/java/com/maviniciusdev/back/auth/PasswordResetTokenRepository.java
package com.maviniciusdev.back.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByToken(String token);
}
