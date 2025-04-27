package com.maviniciusdev.back.spaces;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicSpacesRepository extends JpaRepository<AcademicSpaces, Long> {
    List<AcademicSpaces> findByActiveTrue();

}
