package com.maviniciusdev.back.spaces;


import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic-spaces")
@AllArgsConstructor


public class AcademicSpacesController {

    private final AcademicSpacesService academicSpacesService;

    @PostMapping("/create")
    public ResponseEntity<?> createSpace(@RequestBody AcademicSpaces academicSpaces) {
        try{
            AcademicSpaces createdSpace = academicSpacesService.createSpace(academicSpaces);
            return ResponseEntity.ok(createdSpace);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao criar espaço acadêmico: " + e.getMessage());
        }
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateSpace(@PathVariable Long id, @RequestBody AcademicSpaces academicSpaces) {
        try{
            AcademicSpaces updatedSpace = academicSpacesService.updateSpace(id, academicSpaces);
            return ResponseEntity.ok(updatedSpace);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao atualizar espaço acadêmico: " + e.getMessage());
        }
    }
    @GetMapping("/active")
    public ResponseEntity<List<AcademicSpaces>> getActiveSpaces() {
        return ResponseEntity.ok(academicSpacesService.getActiveSpaces());
    }

    @PutMapping("/update-availability/{id}")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestParam boolean active) {
        try{
            AcademicSpaces updatedSpace = academicSpacesService.updateAvailability(id, active);
            return ResponseEntity.ok(updatedSpace);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao atualizar disponibilidade do espaço acadêmico: " + e.getMessage());
        }
    }
}
