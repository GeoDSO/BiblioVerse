package com.biblioverse.biblioverse.Configuracion;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    // Dominio de tu Frontend en Vercel
    private static final String FRONTEND_URL = "https://biblio-verse.vercel.app";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Sintaxis moderna para deshabilitar CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Sintaxis moderna para CORS

                // Reemplazo del método obsoleto authorizeRequests() por authorizeHttpRequests()
                .authorizeHttpRequests(authorize -> authorize
                        // Permitir explícitamente solicitudes OPTIONS para CORS (sin autenticación)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/api/**").permitAll()

                        // Permite el acceso a /api/auth/login y /api/auth/register sin autenticación
                        // (Ajusta esta ruta si tu endpoint de login/registro es diferente)
                        .requestMatchers("/api/auth/**").permitAll()

                        // Todas las demás solicitudes requieren autenticación
                        .anyRequest().authenticated()
                );

        // Si usas JWT, aquí es donde deberías añadir la configuración de filtros y gestión de sesión
        // ... (Tu código de gestión de sesión y filtros JWT)

        return http.build();
    }

    // Configuración de CORS dentro de Spring Security (Este método está bien)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(FRONTEND_URL));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuración a todas las rutas de la API
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}