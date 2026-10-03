package com.unip.fraud.adapter.out.persistence.adapter;

import com.unip.fraud.application.port.out.repository.ActiveModelRepositoryOutPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ModelRegistryPersistenceAdapter implements ActiveModelRepositoryOutPort {

  private final JdbcTemplate jdbcTemplate;

  public ModelRegistryPersistenceAdapter(final JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public boolean hasActiveModel() {
    final Long count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM ml.model_registry WHERE active = TRUE",
        Long.class
    );
    return count != null && count > 0;
  }
}
