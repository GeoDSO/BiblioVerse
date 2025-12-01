package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LibreriaService {

    private static final String API_URL = "https://openlibrary.org/search.json?q=";

    @Autowired
    private LibroRepository libroRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public void importarLibros(String query, int limite) {
        String url = API_URL + query + "&limit=" + limite;
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("docs")) return;

        List<Map<String, Object>> docs = (List<Map<String, Object>>) response.get("docs");
        for (Map<String, Object> doc : docs) {
            String titulo = (String) doc.get("title");
            List<String> autores = (List<String>) doc.get("author_name");

            if (titulo != null && autores != null && !autores.isEmpty()) {
                Libro libro = Libro.builder()
                        .titulo(titulo)
                        .autor(autores.get(0))
                        .build();
                libroRepository.save(libro);
            }
        }
    }
}
