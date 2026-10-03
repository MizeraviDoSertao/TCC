package com.unip.fraud.adapter.out.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
public class ModelLifecycleKafkaProducer {

  private final KafkaTemplate<String, String> kafkaTemplate;
  private final ObjectMapper objectMapper;
  private final String trainingTopic;
  private final String activationTopic;

  public ModelLifecycleKafkaProducer(
      final KafkaTemplate<String, String> kafkaTemplate,
      final ObjectMapper objectMapper,
      @Value("${fraud.kafka.training-requests-topic}") final String trainingTopic,
      @Value("${fraud.kafka.activation-requests-topic}") final String activationTopic) {
    this.kafkaTemplate = kafkaTemplate;
    this.objectMapper = objectMapper;
    this.trainingTopic = trainingTopic;
    this.activationTopic = activationTopic;
  }

  public void requestTraining(
      final UUID trainingId, final String datasetPath, final String datasetHash) {
    send(trainingTopic, trainingId, Map.of(
        "trainingId", trainingId.toString(),
        "datasetPath", datasetPath,
        "datasetHash", datasetHash
    ));
  }

  public void requestActivation(final UUID trainingId) {
    send(activationTopic, trainingId, Map.of("trainingId", trainingId.toString()));
  }

  private void send(final String topic, final UUID key, final Map<String, ?> event) {
    try {
      kafkaTemplate.send(topic, key.toString(), objectMapper.writeValueAsString(event))
          .get(30, TimeUnit.SECONDS);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Model lifecycle publication was interrupted", exception);
    } catch (Exception exception) {
      throw new IllegalStateException("Could not publish model lifecycle event", exception);
    }
  }
}
