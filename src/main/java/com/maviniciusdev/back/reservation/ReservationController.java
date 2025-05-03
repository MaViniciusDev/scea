// src/main/java/com/maviniciusdev/back/reservation/ReservationController.java
package com.maviniciusdev.back.reservation;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> createReservation(
            @RequestBody Reservation reservation,
            Authentication authentication
    ) {
        Reservation created = reservationService.makeReservation(reservation, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(
            @PathVariable Long id,
            Authentication authentication
    ) {
        reservationService.deleteReservation(id, authentication.getName());
        return ResponseEntity.ok("Reserva deletada com sucesso.");
    }

    @GetMapping("/user")
    public ResponseEntity<List<Reservation>> getUserReservations(Authentication authentication) {
        List<Reservation> reservas = reservationService.getByProfessorEmail(authentication.getName());
        return ResponseEntity.ok(reservas);
    }
}
