CREATE TABLE IF NOT EXISTS ml.model_training (
    id UUID PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    stored_path TEXT NOT NULL,
    dataset_hash VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    requested_by VARCHAR(120) NOT NULL,
    requested_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    model_version VARCHAR(64),
    model_type VARCHAR(32),
    candidate_artifact_path TEXT,
    row_count INTEGER,
    feature_count INTEGER,
    target_column VARCHAR(255),
    metrics TEXT,
    error_message TEXT,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    activated_at TIMESTAMP,
    activated_by VARCHAR(120)
);

CREATE INDEX IF NOT EXISTS idx_model_training_requested
    ON ml.model_training (requested_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uk_model_training_active
    ON ml.model_training (active) WHERE active = TRUE;
