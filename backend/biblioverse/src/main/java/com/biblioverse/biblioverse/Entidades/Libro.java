package com.biblioverse.biblioverse.Entidades;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonBackReference

    private Usuario creador;

    @ManyToOne
    @JoinColumn(name = "biblioteca_id")
    @JsonBackReference

    private Biblioteca biblioteca;

}
