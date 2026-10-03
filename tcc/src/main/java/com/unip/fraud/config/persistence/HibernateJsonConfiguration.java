package com.unip.fraud.config.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.hibernate.cfg.AvailableSettings;
import org.hibernate.type.format.jackson.JacksonJsonFormatMapper;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HibernateJsonConfiguration {

  @Bean
  public HibernatePropertiesCustomizer hibernateJsonCustomizer() {
    final JacksonJsonFormatMapper formatMapper = jsonFormatMapper();
    return properties -> properties.put(AvailableSettings.JSON_FORMAT_MAPPER, formatMapper);
  }

  public static JacksonJsonFormatMapper jsonFormatMapper() {
    final ObjectMapper objectMapper = new ObjectMapper()
        .findAndRegisterModules()
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    return new JacksonJsonFormatMapper(objectMapper);
  }
}
