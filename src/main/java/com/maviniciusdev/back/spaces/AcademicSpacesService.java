package com.maviniciusdev.back.spaces;


import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AcademicSpacesService {

    private final AcademicSpacesRepository academicSpacesRepository;

    public AcademicSpaces createSpace(AcademicSpaces academicSpaces) {
        return academicSpacesRepository.save(academicSpaces);
    }

    public AcademicSpaces updateSpace(Long id, AcademicSpaces academicSpaces) {
        AcademicSpaces spaces = academicSpacesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espaço acadêmico não encontrado"));
        spaces.setName_code(academicSpaces.getName_code());
        spaces.setName(academicSpaces.getName());
        spaces.setDescription(academicSpaces.getDescription());
        spaces.setCapacity(academicSpaces.getCapacity());
        spaces.setActive(academicSpaces.isActive());
        return academicSpacesRepository.save(academicSpaces);
    }
    public List<AcademicSpaces> getActiveSpaces() {
        return academicSpacesRepository.findByActiveTrue();
    }
    public AcademicSpaces updateAvailability(Long id, boolean active) {
        AcademicSpaces spaces = academicSpacesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espaço acadêmico não encontrado"));
        spaces.setActive(active);
        return academicSpacesRepository.save(spaces);
    }
}
