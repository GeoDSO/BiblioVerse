package com.biblioverse.biblioverse.Repositorios;
import com.biblioverse.biblioverse.Entidades.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {}

