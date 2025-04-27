package com.maviniciusdev.back.reservation;


import com.maviniciusdev.back.spaces.AcademicSpaces;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public Reservation makeReservation(Reservation reservation) {

        AcademicSpaces academicSpaces = reservation.getAcademicSpaces();
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                academicSpaces,
                reservation.getReservationDate(),
                reservation.getReservationInit(),
                reservation.getReservationEnd()
        );
        if(!conflicts.isEmpty()){
            throw new RuntimeException("Já existe uma reserva para este espaço acadêmico neste horário.");
        }
        return reservationRepository.save(reservation);
    }
    public void deleteReservation(Long id) {

        if(!reservationRepository.existsById(id)) {
            throw new RuntimeException("Reserva não encontrada");
        }
        reservationRepository.deleteById(id);
    }
}
