package com.biblioverse.biblioverse.Configuracion;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // 1. Define la configuración de CORS
        CorsConfiguration configuration = new CorsConfiguration();

        // CRÍTICO: Reemplaza con la URL EXACTA de tu Frontend en Render
        configuration.setAllowedOrigins(Arrays.asList("https://biblioversefront.onrender.com"));

        // Define los métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Define los encabezados permitidos (incluido Content-Type y Authorization, si usas tokens)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

        // Permite el envío de cookies y credenciales (necesario para la comunicación si usas sesiones)
        configuration.setAllowCredentials(true);

        // 2. Crea la URL source para aplicar la configuración
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica a todas las rutas (/**)

        return source;
    }

// 3. Aplica este bean a la configuración de seguridad (en el método filterChain o SecurityFilterChain)
// Asegúrate de que tu HttpSecurity use cors()

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ... otras configuraciones (csrf, authorizeRequests, etc.)
                .cors(withDefaults()) // <-- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE
        // ... otras configuraciones
        ;
        return http.build();
    }
}