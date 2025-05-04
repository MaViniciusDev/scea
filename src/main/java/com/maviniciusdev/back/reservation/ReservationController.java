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
    public ResponseEntity<Reservation> createReservation(
            @RequestBody Reservation reservation,
            Authentication authentication
    ) {
        Reservation created = reservationService.makeReservation(
                reservation,
                authentication.getName()
        );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReservation(
            @PathVariable Long id,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reservationService.deleteReservation(
                id,
                authentication.getName(),
                isAdmin
        );
        return ResponseEntity.ok("Reserva deletada com sucesso.");
    }

    @GetMapping("/user")
    public ResponseEntity<List<Reservation>> getUserReservations(
            Authentication authentication
    ) {
        List<Reservation> reservas = reservationService
                .getByProfessorEmail(authentication.getName());
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/space/{spaceId}")
    public ResponseEntity<List<Reservation>> getReservationsBySpace(
            @PathVariable Long spaceId,
            Authentication authentication
    ) {
        List<Reservation> reservas = reservationService.getBySpaceId(spaceId);
        return ResponseEntity.ok(reservas);
    }
}
