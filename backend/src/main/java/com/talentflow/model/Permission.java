package com.talentflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la permission est obligatoire")
    @Column(nullable = false, unique = true)
    private String name; // e.g. "READ_COMPANIES", "WRITE_COMPANIES", "CONFIG_SYSTEM"

    private String description;
}
