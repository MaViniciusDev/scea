package com.maviniciusdev.back.reservation;

import com.maviniciusdev.back.spaces.AcademicSpaces;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.academicSpaces = :space AND r.reservationDate = :date " +
            "AND ((r.reservationInit < :endTime AND r.reservationEnd > :startTime) OR " +
            "(r.reservationInit >= :startTime AND r.reservationInit < :endTime))")
    List<Reservation> findConflictingReservations(
            @Param("space") AcademicSpaces space,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT r FROM Reservation r WHERE r.professor.email = :email " +
            "ORDER BY r.reservationDate, r.reservationInit")
    List<Reservation> findByProfessorEmail(@Param("email") String email);
}