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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
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
    @ManyToMany
    @JoinTable(
            name = "usuario_seguidores",
            joinColumns = @JoinColumn(name = "seguidor_id"),
            inverseJoinColumns = @JoinColumn(name = "seguido_id")
    )
    private Set<Usuario> seguidos = new HashSet<>();

    // Relación inversa (quién me sigue a mí)
    @ManyToMany(mappedBy = "seguidos")
    private Set<Usuario> seguidores = new HashSet<>();

    // Relación para seguir bibliotecas
    @ManyToMany
    @JoinTable(
            name = "usuario_biblioteca_seguida",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "biblioteca_id")
    )
    private Set<Biblioteca> bibliotecasSeguidas = new HashSet<>();
}