package com.biblioverse.biblioverse.Entidades;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Rol rol; // ADMIN, NORMAL, NO_REGISTRADO

    @OneToMany(mappedBy = "creador", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<Libro> libros = new HashSet<>();

    @ManyToMany(mappedBy = "usuarios")
    private Set<Biblioteca> bibliotecas = new HashSet<>();

}