package com.unip.fraud.adapter.in.kafka;

import com.unip.fraud.application.service.ModelTrainingService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class ModelLifecycleKafkaConsumer {

  private final ModelTrainingService service;
  private final ObjectMapper objectMapper;

  public ModelLifecycleKafkaConsumer(
      final ModelTrainingService service,
      final ObjectMapper objectMapper) {
    this.service = service;
    this.objectMapper = objectMapper;
  }

  @KafkaListener(
      topics = "${fraud.kafka.training-results-topic}",
      groupId = "${spring.kafka.consumer.group-id}-model-training"
  )
  public void trainingFinished(final String message) {
    try {
      service.finishTraining(objectMapper.readValue(
          message, ModelTrainingService.TrainingResult.class
      ));
    } catch (Exception exception) {
      throw new IllegalArgumentException("Invalid model training result", exception);
    }
  }

  @KafkaListener(
      topics = "${fraud.kafka.activation-results-topic}",
      groupId = "${spring.kafka.consumer.group-id}-model-activation"
  )
  public void activationFinished(final String message) {
    try {
      service.finishActivation(objectMapper.readValue(
          message, ModelTrainingService.ActivationResult.class
      ));
    } catch (Exception exception) {
      throw new IllegalArgumentException("Invalid model activation result", exception);
    }
  }
}
