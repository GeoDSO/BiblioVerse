package com.biblioverse.biblioverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.biblioverse.biblioverse.Repositorios")
public class BiblioverseApplication {

    public static void main(String[] args) {
        SpringApplication.run(BiblioverseApplication.class, args);
    }

}
