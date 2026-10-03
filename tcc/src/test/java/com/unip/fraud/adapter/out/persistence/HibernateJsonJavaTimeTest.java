package com.unip.fraud.adapter.out.persistence;

import com.unip.fraud.config.persistence.HibernateJsonConfiguration;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class HibernateJsonJavaTimeTest {

  @Test
  void serializesDynamicDatasetDatesWithTheModulesDiscoveredByHibernate() throws Exception {
    final Map<String, Object> row = new LinkedHashMap<>();
    row.put("data_sinistro", LocalDateTime.of(2026, 9, 30, 14, 45));

    final String json = HibernateJsonConfiguration.jsonFormatMapper()
        .toString(row, Map.class);

    assertThat(json)
        .contains("data_sinistro")
        .contains("2026-09-30T14:45:00");
  }
}
