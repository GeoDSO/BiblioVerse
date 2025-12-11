package com.biblioverse.biblioverse.Entidades;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
public class Biblioteca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include  // ← Solo usa el ID
    private Long id;

    private String nombre;
    private String descripcion;

    private Boolean esPublica;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"bibliotecasCreadas", "librosAgregados"})
    private Usuario creador;

    @ManyToMany
    @JoinTable(
            name = "biblioteca_usuarios",
            joinColumns = @JoinColumn(name = "biblioteca_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    @JsonIgnore
    private Set<Usuario> usuarios = new HashSet<>();

    @OneToMany(mappedBy = "biblioteca", cascade = CascadeType.ALL)
    @JsonManagedReference("libro-biblioteca")
    private Set<Libro> libros = new HashSet<>();

    @ManyToMany(mappedBy = "bibliotecasSeguidas")
    private Set<Usuario> seguidores = new HashSet<>();
}

