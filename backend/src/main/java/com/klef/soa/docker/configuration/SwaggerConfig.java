package com.klef.soa.docker.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Fitness Challenge Management API")
                        .version("1.0.0")
                        .description("API documentation for managing CRUD operations on fitness challenges.")
                        .contact(new Contact()
                                .name("Exam Support")
                                .email("support@://klef.com")));
    }
}
