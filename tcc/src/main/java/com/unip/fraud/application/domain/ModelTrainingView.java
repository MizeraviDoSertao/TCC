package com.unip.fraud.application.domain;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record ModelTrainingView(
    UUID trainingId,
    String fileName,
    String datasetHash,
    String status,
    String requestedBy,
    LocalDateTime requestedAt,
    LocalDateTime completedAt,
    String modelVersion,
    String modelType,
    Integer rowCount,
    Integer featureCount,
    String targetColumn,
    Map<String, Double> metrics,
    String errorMessage,
    boolean active,
    LocalDateTime activatedAt,
    String activatedBy
) {}
