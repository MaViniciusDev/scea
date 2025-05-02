// AcademicSpaces.java
package com.maviniciusdev.back.spaces;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "academic_spaces")
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
    @Column(name = "name_code", nullable = false)
    private String nameCode;

    @Column(nullable = false)
    private String name;

    @Column(length = 1500)
    private String description;

    @Column(nullable = false)
    private int capacity;

    // Tipo de espaço: SALA, LAB ou AUDITORIO
    @Column(name = "space_type", nullable = false)
    private String spaceType;

    @Column(name = "has_computer", nullable = false)
    private boolean hasComputer = false;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    // Motivo da desativação quando active = false
    @Column(name = "disable_reason", length = 500)
    private String disableReason;
}
