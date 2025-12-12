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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Biblioteca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String nombre;
    private String descripcion;

    private Boolean esPublica;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"bibliotecasCreadas", "librosAgregados", "seguidores", "seguidos", "bibliotecasSeguidas", "password"})
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

    // IMPORTANTE: NO pongas @JsonIgnore aquí, necesitamos los seguidores en el JSON
    @ManyToMany(mappedBy = "bibliotecasSeguidas")
    @JsonIgnoreProperties({"bibliotecasCreadas", "librosAgregados", "seguidores", "seguidos", "bibliotecasSeguidas", "password"})
    private Set<Usuario> seguidores = new HashSet<>();
}