package com.unip.fraud.application.domain;

public enum ModelTrainingStatus {
  QUEUED,
  TRAINING,
  READY,
  ACTIVATING,
  ACTIVE,
  FAILED,
  ACTIVATION_FAILED
}
