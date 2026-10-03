package com.unip.fraud.adapter.out.persistence.entity;

import com.unip.fraud.application.domain.ModelTrainingView;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "model_training", schema = "ml")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ModelTrainingEntity {

  @Id
  private UUID id;
  @Column(length = 255, nullable = false)
  private String fileName;
  @Column(columnDefinition = "TEXT", nullable = false)
  private String storedPath;
  @Column(length = 64, nullable = false)
  private String datasetHash;
  @Column(length = 32, nullable = false)
  private String status;
  @Column(length = 120, nullable = false)
  private String requestedBy;
  @Column(nullable = false)
  private LocalDateTime requestedAt;
  private LocalDateTime completedAt;
  @Column(length = 64)
  private String modelVersion;
  @Column(length = 32)
  private String modelType;
  @Column(columnDefinition = "TEXT")
  private String candidateArtifactPath;
  private Integer rowCount;
  private Integer featureCount;
  @Column(length = 255)
  private String targetColumn;
  @Column(columnDefinition = "TEXT")
  private String metrics;
  @Column(columnDefinition = "TEXT")
  private String errorMessage;
  @Column(nullable = false)
  private boolean active;
  private LocalDateTime activatedAt;
  @Column(length = 120)
  private String activatedBy;

  public void markTraining() {
    status = "TRAINING";
  }

  public void markReady(
      final String modelVersion,
      final String modelType,
      final String artifactPath,
      final Integer rowCount,
      final Integer featureCount,
      final String targetColumn,
      final String metrics,
      final LocalDateTime completedAt) {
    this.status = "READY";
    this.modelVersion = modelVersion;
    this.modelType = modelType;
    this.candidateArtifactPath = artifactPath;
    this.rowCount = rowCount;
    this.featureCount = featureCount;
    this.targetColumn = targetColumn;
    this.metrics = metrics;
    this.errorMessage = null;
    this.completedAt = completedAt;
  }

  public void markFailed(final String status, final String error, final LocalDateTime completedAt) {
    this.status = status;
    this.errorMessage = error;
    this.completedAt = completedAt;
  }

  public void markActivating(final String activatedBy) {
    this.status = "ACTIVATING";
    this.activatedBy = activatedBy;
    this.errorMessage = null;
  }

  public void markActive(final LocalDateTime activatedAt) {
    this.status = "ACTIVE";
    this.active = true;
    this.activatedAt = activatedAt;
    this.errorMessage = null;
  }

  public void deactivate() {
    this.active = false;
    if ("ACTIVE".equals(status)) {
      this.status = "READY";
    }
  }

  public ModelTrainingView toView(final ObjectMapper objectMapper) {
    Map<String, Double> parsedMetrics = Map.of();
    if (metrics != null && !metrics.isBlank()) {
      try {
        parsedMetrics = objectMapper.readValue(
            metrics,
            objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Double.class)
        );
      } catch (Exception ignored) {
        parsedMetrics = Map.of();
      }
    }
    return new ModelTrainingView(
        id, fileName, datasetHash, status, requestedBy, requestedAt, completedAt,
        modelVersion, modelType, rowCount, featureCount, targetColumn, parsedMetrics,
        errorMessage, active, activatedAt, activatedBy
    );
  }
}
