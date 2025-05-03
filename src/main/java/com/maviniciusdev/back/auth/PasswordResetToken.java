package com.maviniciusdev.back.auth;

import com.maviniciusdev.back.appuser.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {

    @Id
    @SequenceGenerator(
            name = "password_reset_token_seq",
            sequenceName = "password_reset_token_seq",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "password_reset_token_seq")
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime confirmedAt;

    @OneToOne
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser user;

    public PasswordResetToken(AppUser user, LocalDateTime expiresAt) {
        this.token = UUID.randomUUID().toString();
        this.user = user;
        this.expiresAt = expiresAt;
    }
}
