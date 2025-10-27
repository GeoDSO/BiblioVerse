package com.biblioverse.biblioverse.Repositorios;

import com.biblioverse.biblioverse.Entidades.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {

    List<Libro> findByTituloContainingIgnoreCase(String titulo);

    @Query("SELECT l FROM Libro l WHERE l.agregador.username LIKE %:username%")
    List<Libro> findByAgregadorUsernameContaining(@Param("username") String username);

    @Query("SELECT l FROM Libro l WHERE l.titulo LIKE %:titulo% AND l.agregador.username LIKE %:username%")
    List<Libro> findByTituloContainingIgnoreCaseAndAgregadorUsernameContaining(@Param("titulo") String titulo, @Param("username") String username);
}

