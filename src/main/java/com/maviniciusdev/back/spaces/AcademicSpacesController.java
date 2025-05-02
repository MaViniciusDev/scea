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
        try {
            return ResponseEntity.ok(academicSpacesService.createSpace(academicSpaces));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao criar espaço acadêmico: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateSpace(@PathVariable Long id,
                                         @RequestBody AcademicSpaces academicSpaces) {
        try {
            return ResponseEntity.ok(academicSpacesService.updateSpace(id, academicSpaces));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao atualizar espaço acadêmico: " + e.getMessage());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<AcademicSpaces>> getActiveSpaces() {
        return ResponseEntity.ok(academicSpacesService.getActiveSpaces());
    }

    // Novo endpoint: retorna todos espaços, ativos ou não
    @GetMapping("/all")
    public ResponseEntity<List<AcademicSpaces>> getAllSpaces() {
        return ResponseEntity.ok(academicSpacesService.getAllSpaces());
    }

    @PutMapping("/update-availability/{id}")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id,
                                                @RequestParam boolean active) {
        try {
            return ResponseEntity.ok(academicSpacesService.updateAvailability(id, active));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao atualizar disponibilidade do espaço acadêmico: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSpace(@PathVariable Long id) {
        try {
            academicSpacesService.deleteSpace(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao excluir espaço acadêmico: " + e.getMessage());
        }
    }
}
