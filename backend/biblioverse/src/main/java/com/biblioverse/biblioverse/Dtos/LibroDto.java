package com.biblioverse.biblioverse.Dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LibroDto {

    @NotBlank(message = "El título no puede estar vacío")
    private String titulo;

    @NotBlank(message = "El autor no puede estar vacío")
    private String autor;

    @NotNull(message = "Debe indicar el ID del usuario creador")
    private Long idUsuario;

    @NotNull(message = "Debe indicar el ID de la biblioteca donde se añadirá el libro")
    private Long idBiblioteca;
}
