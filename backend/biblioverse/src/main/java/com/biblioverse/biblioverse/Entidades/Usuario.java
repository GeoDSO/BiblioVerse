package com.biblioverse.biblioverse.Entidades;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)  // ← CAMBIADO
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @OneToMany(mappedBy = "creador", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Biblioteca> bibliotecasCreadas = new HashSet<>();

    @OneToMany(mappedBy = "agregador", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Libro> librosAgregados = new HashSet<>();
}