// AcademicSpacesService.java
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

        spaces.setNameCode(academicSpaces.getNameCode());
        spaces.setName(academicSpaces.getName());
        spaces.setDescription(academicSpaces.getDescription());
        spaces.setCapacity(academicSpaces.getCapacity());
        spaces.setSpaceType(academicSpaces.getSpaceType());
        spaces.setHasComputer(academicSpaces.isHasComputer());
        spaces.setActive(academicSpaces.isActive());

        return academicSpacesRepository.save(spaces);
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

    public void deleteSpace(Long id) {
        AcademicSpaces spaces = academicSpacesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espaço acadêmico não encontrado"));
        academicSpacesRepository.delete(spaces);
    }
}
