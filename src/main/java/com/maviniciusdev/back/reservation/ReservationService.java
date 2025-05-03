// src/main/java/com/maviniciusdev/back/reservation/ReservationService.java
package com.maviniciusdev.back.reservation;

import com.maviniciusdev.back.appuser.AppUser;
import com.maviniciusdev.back.appuser.AppUserRepository;
import com.maviniciusdev.back.spaces.AcademicSpaces;
import com.maviniciusdev.back.spaces.AcademicSpacesRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ReservationService {

    private final ReservationRepository    reservationRepository;
    private final AppUserRepository        userRepository;
    private final AcademicSpacesRepository spacesRepository;

    /**
     * Faz a reserva usando o email do professor autenticado.
     */
    public Reservation makeReservation(Reservation reservation, String professorEmail) {
        // 1. Carrega o usuário
        AppUser professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + professorEmail));
        reservation.setProfessor(professor);

        // 2. Carrega o espaço acadêmico
        Long spaceId = reservation.getAcademicSpaces().getId();
        AcademicSpaces space = spacesRepository.findById(spaceId)
                .orElseThrow(() -> new IllegalArgumentException("Espaço não encontrado: id=" + spaceId));
        reservation.setAcademicSpaces(space);

        // 3. Valida data e horário
        LocalDate date = reservation.getReservationDate();
        LocalTime init = reservation.getReservationInit();
        LocalTime end  = reservation.getReservationEnd();

        if (!end.isAfter(init)) {
            throw new IllegalArgumentException("Horário final deve ser após o horário inicial.");
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (date.isBefore(today)) {
            throw new IllegalArgumentException("Não é possível criar reservas em datas passadas.");
        }

        if (date.isEqual(today) && end.isBefore(now)) {
            throw new IllegalArgumentException("Horário final da reserva deve ser no futuro.");
        }

        // 4. Checa conflitos
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(space, date, init, end);
        if (!conflicts.isEmpty()) {
            throw new ReservationConflictException("Já existe reserva conflitando neste horário.");
        }

        // 5. Salva
        return reservationRepository.save(reservation);
    }
    /**
     * Deleta apenas se for do mesmo professor.
     */
    public void deleteReservation(Long id, String professorEmail) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada: id=" + id));

        if (!r.getProfessor().getEmail().equals(professorEmail)) {
            throw new AccessDeniedException("Você não pode deletar reserva de outro usuário");
        }

        reservationRepository.delete(r);
    }

    /**
     * Lista reservas futuras do professor.
     */
    public List<Reservation> getByProfessorEmail(String email) {
        return reservationRepository.findByProfessorEmail(email);
    }

    // --- exceções customizadas ---
    public static class ReservationConflictException extends RuntimeException {
        public ReservationConflictException(String msg) {
            super(msg);
        }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String msg) {
            super(msg);
        }
    }
}
