package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    // Carpeta donde se guardan los archivos
    private final String UPLOAD_DIR = "uploads/";

    public Libro subirLibro(String titulo, String autor, String descripcion,
                            Long idUsuario,
                            MultipartFile archivoPdf, MultipartFile portada) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        // Crear directorio si no existe
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        Libro libro = new Libro();
        libro.setTitulo(titulo);
        libro.setAutor(autor);
        libro.setDescripcion(descripcion);
        libro.setAgregador(usuario);

        // Guardar PDF
        if (archivoPdf != null && !archivoPdf.isEmpty()) {
            String rutaPdf = guardarArchivo(archivoPdf, "pdfs");
            libro.setRutaPdf(rutaPdf);
        }

        // Guardar Portada
        if (portada != null && !portada.isEmpty()) {
            String rutaPortada = guardarArchivo(portada, "portadas");
            libro.setRutaPortada(rutaPortada);
        }

        return libroRepository.save(libro);
    }

    private String guardarArchivo(MultipartFile archivo, String carpeta) {
        try {
            // Crear carpeta específica
            String directorioCompleto = UPLOAD_DIR + carpeta + "/";
            File dir = new File(directorioCompleto);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Generar nombre único
            String extension = archivo.getOriginalFilename()
                    .substring(archivo.getOriginalFilename().lastIndexOf("."));
            String nombreUnico = UUID.randomUUID().toString() + extension;

            // Guardar archivo
            Path rutaArchivo = Paths.get(directorioCompleto + nombreUnico);
            Files.write(rutaArchivo, archivo.getBytes());

            // Retornar ruta relativa
            return "/uploads/" + carpeta + "/" + nombreUnico;

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar archivo: " + e.getMessage());
        }
    }

    public List<Libro> listarLibros() {
        return libroRepository.findAll();
    }

    public List<Libro> buscarLibros(String titulo, String username) {
        if (titulo != null && username != null) {
            return libroRepository.findByTituloContainingIgnoreCaseAndAgregadorUsernameContaining(titulo, username);
        } else if (titulo != null) {
            return libroRepository.findByTituloContainingIgnoreCase(titulo);
        } else if (username != null) {
            return libroRepository.findByAgregadorUsernameContaining(username);
        } else {
            return listarLibros();
        }
    }
}