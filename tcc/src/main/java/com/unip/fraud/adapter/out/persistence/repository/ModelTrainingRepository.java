package com.unip.fraud.adapter.out.persistence.repository;

import com.unip.fraud.adapter.out.persistence.entity.ModelTrainingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ModelTrainingRepository extends JpaRepository<ModelTrainingEntity, UUID> {
  List<ModelTrainingEntity> findTop50ByOrderByRequestedAtDesc();
  Optional<ModelTrainingEntity> findFirstByActiveTrue();
}
