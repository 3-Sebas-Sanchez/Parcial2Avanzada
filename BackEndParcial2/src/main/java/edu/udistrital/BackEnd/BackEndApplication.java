package edu.udistrital.BackEnd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class BackEndApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackEndApplication.class, args);
	}
        
        @Bean 
        
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")

                        .allowedOrigins(
                            "http://localhost:3000",
                            "http://localhost:4200",
                            "http://localhost:5500",    
                            "http://127.0.0.1:5500"
                        )
                        // Métodos HTTP permitidos
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        // Headers permitidos
                        .allowedHeaders("*")
                        // Permite enviar credenciales (cookies, headers de autorización)
                        .allowCredentials(true);
            }
        };
    }

}
