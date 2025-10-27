package com.biblioverse.biblioverse.Entidades;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)  // ← CAMBIADO
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include  // ← Solo usa el ID
    private Long id;

    private String titulo;
    private String autor;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonBackReference("libro-agregador")
    private Usuario agregador;

    @ManyToOne
    @JoinColumn(name = "biblioteca_id")
    @JsonBackReference("libro-biblioteca")
    private Biblioteca biblioteca;
}
