import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, interval, startWith, switchMap } from 'rxjs';

import { ModelTraining, ModelTrainingStatus } from './model.model';
import { ModelService } from './model.service';

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './models.component.html',
  styleUrl: './models.component.css'
})
export class ModelsComponent implements OnInit {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private readonly service = inject(ModelService);
  private readonly destroyRef = inject(DestroyRef);

  models: readonly ModelTraining[] = [];
  selectedFile?: File;
  adminUser = '';
  adminPassword = '';
  loading = true;
  submitting = false;
  activatingId = '';
  errorMessage = '';

  ngOnInit(): void {
    interval(10_000)
      .pipe(
        startWith(0),
        switchMap(() => this.service.list().pipe(
          catchError(() => {
            this.loading = false;
            this.errorMessage = 'Não foi possível consultar os modelos.';
            return EMPTY;
          })
        )),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(models => {
        this.models = models;
        this.loading = false;
      });
  }

  get activeModel(): ModelTraining | undefined {
    return this.models.find(model => model.active);
  }

  chooseFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.item(0) ?? undefined;
    this.errorMessage = '';
  }

  train(): void {
    if (!this.selectedFile || !this.adminUser || !this.adminPassword || this.submitting) {
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    this.service.train(this.selectedFile, this.adminUser, this.adminPassword)
      .pipe(
        finalize(() => this.submitting = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: model => {
          this.models = [model, ...this.models.filter(item => item.trainingId !== model.trainingId)];
          this.selectedFile = undefined;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        },
        error: error => this.errorMessage = error?.error?.message
          ?? 'Não foi possível solicitar o treinamento.'
      });
  }

  activate(model: ModelTraining): void {
    if (!this.adminUser || !this.adminPassword || this.activatingId) {
      return;
    }
    this.activatingId = model.trainingId;
    this.errorMessage = '';
    this.service.activate(model.trainingId, this.adminUser, this.adminPassword)
      .pipe(
        finalize(() => this.activatingId = ''),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: updated => this.models = this.models.map(item =>
          item.trainingId === updated.trainingId ? updated : item
        ),
        error: error => this.errorMessage = error?.error?.message
          ?? 'Não foi possível ativar este modelo.'
      });
  }

  statusLabel(status: ModelTrainingStatus): string {
    return ({
      QUEUED: 'Na fila',
      TRAINING: 'Treinando',
      READY: 'Pronto para ativar',
      ACTIVATING: 'Ativando',
      ACTIVE: 'Ativo',
      FAILED: 'Falhou',
      ACTIVATION_FAILED: 'Falha na ativação'
    } as Record<ModelTrainingStatus, string>)[status];
  }

  modelTypeLabel(type: string | null): string {
    return type === 'SUPERVISED' ? 'Supervisionado' : type === 'ANOMALY' ? 'Anomalias' : '—';
  }

  metricEntries(model: ModelTraining): readonly [string, number][] {
    return Object.entries(model.metrics);
  }

  metricLabel(name: string): string {
    return ({ accuracy: 'Acurácia', precision: 'Precisão', recall: 'Recall', f1: 'F1', roc_auc: 'ROC AUC' } as Record<string, string>)[name] ?? name;
  }

  fileSize(file: File): string {
    return `${(file.size / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} MB`;
  }
}
