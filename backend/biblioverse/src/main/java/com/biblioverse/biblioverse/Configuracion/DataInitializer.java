package com.biblioverse.biblioverse.Configuracion;

import com.biblioverse.biblioverse.Servicios.LibreriaService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final LibreriaService libreriaService;

    public DataInitializer(LibreriaService libreriaService) {
        this.libreriaService = libreriaService;
    }

    @Override
    public void run(String... args) {
        System.out.println("⏳ Importando libros desde Open Library...");
        libreriaService.importarLibros("fantasy", 10); // puedes cambiar el tema
        libreriaService.importarLibros("science", 10);
        libreriaService.importarLibros("history", 10);
        System.out.println("✅ Libros importados correctamente.");
    }
}
