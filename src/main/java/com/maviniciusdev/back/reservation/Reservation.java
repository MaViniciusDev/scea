package com.maviniciusdev.back.reservation;

import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.spaces.AcademicSpaces;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Reservation {

    @SequenceGenerator(
            name = "reservation_sequence",
            sequenceName = "reservation_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "reservation_sequence"
    )
    private Long id;

    @ManyToOne
    @JoinColumn(name = "academic_spaces_id", nullable = false)
    private AcademicSpaces academicSpaces;

    @ManyToOne
    @JoinColumn(name = "professor_id", nullable = false)
    private AppUser professor;

    private LocalDate reservationDate;
    private LocalTime reservationInit;
    private LocalTime reservationEnd;

    // novo: tipo da reserva (AULA ou EVENTO)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationType type;

    // novo: timestamp de criação
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // novo: comentários/opcionais do professor
    @Column(length = 500)
    private String observations;

    private boolean confirmUse = false;
    private boolean ended     = false;

    public enum ReservationType {
        AULA, EVENTO
    }
}
