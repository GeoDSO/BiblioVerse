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
public class BibliotecaDto {

    @NotBlank(message = "El nombre de la biblioteca no puede estar vacío")
    private String nombre;

    @NotNull(message = "Debe especificar si la biblioteca es pública o no")
    private Boolean esPublica;

    @NotNull(message = "Debe indicar el ID del usuario que la añadió")
    private Long idUsuario;
}
