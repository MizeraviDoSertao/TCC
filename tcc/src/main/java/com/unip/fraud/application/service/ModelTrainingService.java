package com.unip.fraud.application.service;

import com.unip.fraud.adapter.out.kafka.ModelLifecycleKafkaProducer;
import com.unip.fraud.adapter.out.persistence.entity.ModelTrainingEntity;
import com.unip.fraud.adapter.out.persistence.repository.ModelTrainingRepository;
import com.unip.fraud.application.domain.ImportFileCommand;
import com.unip.fraud.application.domain.ModelTrainingView;
import com.unip.fraud.application.exception.ResourceNotFoundException;
import com.unip.fraud.application.port.out.importing.ImportFileStorageOutPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static com.unip.fraud.application.validation.Validation.requireArgument;

@Service
public class ModelTrainingService {

  private static final Set<String> READY_STATUSES = Set.of("READY", "ACTIVATION_FAILED");

  private final ImportFileStorageOutPort storage;
  private final ModelTrainingRepository repository;
  private final ModelLifecycleKafkaProducer producer;
  private final ObjectMapper objectMapper;
  private final JdbcTemplate jdbcTemplate;
  private final long maxFileSize;

  public ModelTrainingService(
      final ImportFileStorageOutPort storage,
      final ModelTrainingRepository repository,
      final ModelLifecycleKafkaProducer producer,
      final ObjectMapper objectMapper,
      final JdbcTemplate jdbcTemplate,
      @Value("${imports.max-file-size}") final long maxFileSize) {
    this.storage = storage;
    this.repository = repository;
    this.producer = producer;
    this.objectMapper = objectMapper;
    this.jdbcTemplate = jdbcTemplate;
    this.maxFileSize = maxFileSize;
  }

  public ModelTrainingView requestTraining(
      final ImportFileCommand command, final String requestedBy) {
    validate(command);
    final UUID trainingId = UUID.randomUUID();
    final var storedFile = storage.store(trainingId, command);
    final ModelTrainingEntity entity = ModelTrainingEntity.builder()
        .id(trainingId)
        .fileName(storedFile.fileName())
        .storedPath(storedFile.path())
        .datasetHash(storedFile.sha256())
        .status("QUEUED")
        .requestedBy(safeUser(requestedBy))
        .requestedAt(LocalDateTime.now())
        .active(false)
        .build();
    repository.save(entity);
    try {
      entity.markTraining();
      repository.save(entity);
      producer.requestTraining(trainingId, storedFile.path(), storedFile.sha256());
      return entity.toView(objectMapper);
    } catch (RuntimeException exception) {
      entity.markFailed("FAILED", exception.getMessage(), LocalDateTime.now());
      repository.save(entity);
      throw exception;
    }
  }

  public List<ModelTrainingView> list() {
    return repository.findTop50ByOrderByRequestedAtDesc().stream()
        .map(entity -> entity.toView(objectMapper))
        .toList();
  }

  public ModelTrainingView requestActivation(final UUID trainingId, final String activatedBy) {
    final ModelTrainingEntity entity = required(trainingId);
    requireArgument(
        READY_STATUSES.contains(entity.getStatus()),
        "Only a model that finished training can be activated"
    );
    entity.markActivating(safeUser(activatedBy));
    repository.save(entity);
    try {
      producer.requestActivation(trainingId);
      return entity.toView(objectMapper);
    } catch (RuntimeException exception) {
      entity.markFailed("ACTIVATION_FAILED", exception.getMessage(), LocalDateTime.now());
      repository.save(entity);
      throw exception;
    }
  }

  public void finishTraining(final TrainingResult result) {
    final ModelTrainingEntity entity = required(result.trainingId());
    if (!"READY".equals(result.status())) {
      entity.markFailed("FAILED", result.error(), LocalDateTime.now());
    } else {
      try {
        entity.markReady(
            result.modelVersion(), result.modelType(), result.artifactPath(),
            result.rows(), result.featureCount(), result.targetColumn(),
            objectMapper.writeValueAsString(result.metrics() == null ? Map.of() : result.metrics()),
            LocalDateTime.now()
        );
      } catch (Exception exception) {
        entity.markFailed("FAILED", "Could not persist training metrics", LocalDateTime.now());
      }
    }
    repository.save(entity);
  }

  @Transactional
  public void finishActivation(final ActivationResult result) {
    final ModelTrainingEntity entity = required(result.trainingId());
    if (!"ACTIVE".equals(result.status())) {
      entity.markFailed("ACTIVATION_FAILED", result.error(), LocalDateTime.now());
      repository.save(entity);
      return;
    }
    repository.findFirstByActiveTrue().ifPresent(active -> {
      if (!active.getId().equals(entity.getId())) {
        active.deactivate();
        repository.saveAndFlush(active);
      }
    });
    entity.markActive(LocalDateTime.now());
    repository.save(entity);
    registerActiveModel(entity);
  }

  private void registerActiveModel(final ModelTrainingEntity entity) {
    jdbcTemplate.update("UPDATE ml.model_registry SET active = FALSE WHERE active = TRUE");
    jdbcTemplate.update("""
        INSERT INTO ml.model_registry (
          model_version, model_type, feature_schema, metrics, threshold, active, trained_at
        ) VALUES (?, ?, CAST('{}' AS jsonb), CAST(? AS jsonb), NULL, TRUE, ?)
        ON CONFLICT (model_version) DO UPDATE SET
          metrics = EXCLUDED.metrics, active = TRUE, trained_at = EXCLUDED.trained_at
        """,
        entity.getModelVersion(),
        entity.getModelType(),
        entity.getMetrics() == null ? "{}" : entity.getMetrics(),
        entity.getCompletedAt()
    );
  }

  private ModelTrainingEntity required(final UUID trainingId) {
    return repository.findById(trainingId)
        .orElseThrow(() -> new ResourceNotFoundException("Model training not found"));
  }

  private void validate(final ImportFileCommand command) {
    requireArgument(command != null, "The training dataset is required");
    requireArgument(command.fileName() != null && !command.fileName().isBlank(), "The dataset must have a file name");
    requireArgument(command.size() > 0, "Select a non-empty training dataset");
    requireArgument(command.size() <= maxFileSize, "The dataset exceeds the configured size limit");
    final String fileName = command.fileName().toLowerCase(Locale.ROOT);
    requireArgument(
        fileName.endsWith(".csv") || fileName.endsWith(".xls") || fileName.endsWith(".xlsx"),
        "Supported formats: .csv, .xlsx and .xls"
    );
  }

  private String safeUser(final String value) {
    return value == null || value.isBlank() ? "administrator" : value.trim().substring(0, Math.min(value.trim().length(), 120));
  }

  public record TrainingResult(
      UUID trainingId,
      String status,
      String modelVersion,
      String modelType,
      String artifactPath,
      Integer rows,
      Integer featureCount,
      String targetColumn,
      Map<String, Double> metrics,
      String error
  ) {}

  public record ActivationResult(
      UUID trainingId,
      String status,
      String modelVersion,
      String error
  ) {}
}
