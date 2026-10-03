export type ModelTrainingStatus =
  | 'QUEUED'
  | 'TRAINING'
  | 'READY'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'FAILED'
  | 'ACTIVATION_FAILED';

export interface ModelTraining {
  readonly trainingId: string;
  readonly fileName: string;
  readonly datasetHash: string;
  readonly status: ModelTrainingStatus;
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly completedAt: string | null;
  readonly modelVersion: string | null;
  readonly modelType: string | null;
  readonly rowCount: number | null;
  readonly featureCount: number | null;
  readonly targetColumn: string | null;
  readonly metrics: Readonly<Record<string, number>>;
  readonly errorMessage: string | null;
  readonly active: boolean;
  readonly activatedAt: string | null;
  readonly activatedBy: string | null;
}
