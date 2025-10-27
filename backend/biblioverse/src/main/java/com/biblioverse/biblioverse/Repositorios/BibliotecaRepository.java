package com.biblioverse.biblioverse.Repositorios;
import com.biblioverse.biblioverse.Entidades.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {

    // Buscar bibliotecas por nombre (parcial y sin distinguir mayúsculas/minúsculas)
    List<Biblioteca> findByNombreContainingIgnoreCase(String nombre);

    // Buscar bibliotecas por nombre y creador
    List<Biblioteca> findByNombreContainingIgnoreCaseAndCreadorUsernameContaining(String nombre, String username);

    // Buscar bibliotecas por creador solamente
    List<Biblioteca> findByCreadorUsernameContaining(String username);
}

