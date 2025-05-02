// AcademicSpaces.java
package com.maviniciusdev.back.spaces;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class AcademicSpaces {

    @SequenceGenerator(
            name = "academic_spaces_sequence",
            sequenceName = "academic_spaces_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy = jakarta.persistence.GenerationType.SEQUENCE,
            generator = "academic_spaces_sequence"
    )
    private Long id;

    @JsonProperty("nameCode")
    @Column(name = "name_code")
    private String nameCode;

    private String name;
    private String description;
    private int capacity;

    // Tipo de espaço: SALA, LAB ou AUDITORIO
    private String spaceType;

    private boolean hasComputer = false;
    private boolean active      = true;
}
