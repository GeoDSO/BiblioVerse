package com.biblioverse.biblioverse.Entidades;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Biblioteca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private boolean esPublica;

    @ManyToMany
    @JoinTable(
            name = "biblioteca_usuarios",
            joinColumns = @JoinColumn(name = "biblioteca_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private Set<Usuario> usuarios = new HashSet<>();

    @OneToMany(mappedBy = "biblioteca", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<Libro> libros = new HashSet<>();

}

