package com.maviniciusdev.back.spaces;

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
    private String name_code;
    private String name;
    private String description;
    private int capacity;

    private boolean active = true;
}
