package com.maviniciusdev.back.reservation;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@AllArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Reservation reservation) {
        try {
            Reservation createdReservation = reservationService.makeReservation(reservation);
            return ResponseEntity.ok(createdReservation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao criar reserva: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id) {
        try {
            reservationService.deleteReservation(id);
            return ResponseEntity.ok("Reserva deletada com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao deletar reserva: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<Reservation>> getUserReservations(Authentication authentication) {
        String email = authentication.getName();
        List<Reservation> reservas = reservationService.getByProfessorEmail(email);
        return ResponseEntity.ok(reservas);
    }
}
