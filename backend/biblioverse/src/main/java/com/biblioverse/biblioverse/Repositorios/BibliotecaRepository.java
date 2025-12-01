package com.biblioverse.biblioverse.Repositorios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {

    @Query("SELECT b FROM Biblioteca b WHERE LOWER(b.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Biblioteca> findByNombreContainingIgnoreCase(@Param("nombre") String nombre);

    @Query("SELECT b FROM Biblioteca b WHERE LOWER(b.creador.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Biblioteca> findByCreadorUsernameContainingIgnoreCase(@Param("username") String username);

    @Query("SELECT b FROM Biblioteca b WHERE LOWER(b.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND LOWER(b.creador.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Biblioteca> findByNombreContainingIgnoreCaseAndCreadorUsernameContainingIgnoreCase(@Param("nombre") String nombre, @Param("username") String username);
}