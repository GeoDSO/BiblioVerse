package com.biblioverse.biblioverse.Repositorios;

import com.biblioverse.biblioverse.Entidades.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {

    @Query("SELECT l FROM Libro l WHERE l.esPublico = true")
    List<Libro> findByEsPublicoTrue();

    @Query("SELECT l FROM Libro l WHERE l.agregador.id = :usuarioId AND l.esPublico = false")
    List<Libro> findByUsuarioIdAndEsPublicoFalse(@Param("usuarioId") Long usuarioId);

    @Query("SELECT l FROM Libro l WHERE LOWER(l.autor) LIKE LOWER(CONCAT('%', :autor, '%'))")
    List<Libro> findByAutorContainingIgnoreCase(@Param("autor") String autor);

    @Query("SELECT l FROM Libro l WHERE LOWER(l.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')) AND LOWER(l.autor) LIKE LOWER(CONCAT('%', :autor, '%'))")
    List<Libro> findByTituloContainingIgnoreCaseAndAutorContainingIgnoreCase(@Param("titulo") String titulo, @Param("autor") String autor);

    @Query("SELECT l FROM Libro l WHERE LOWER(l.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))")
    List<Libro> findByTituloContainingIgnoreCase(@Param("titulo") String titulo);

    @Query("SELECT l FROM Libro l WHERE LOWER(l.agregador.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Libro> findByAgregadorUsernameContaining(@Param("username") String username);

    @Query("SELECT l FROM Libro l WHERE LOWER(l.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')) AND LOWER(l.agregador.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Libro> findByTituloContainingIgnoreCaseAndAgregadorUsernameContaining(@Param("titulo") String titulo, @Param("username") String username);
}