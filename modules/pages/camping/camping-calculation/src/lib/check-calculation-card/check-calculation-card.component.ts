import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  type WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, merge, Subject, takeUntil, type Observable } from 'rxjs';
import { DestroyService } from 'shared_destroy-service';
import { v4 as uuidv4 } from 'uuid';
import { CheckResultComponent } from '../check-result/check-result.component';
import { CheckPerformerService, type CheckResult } from '../services';
import { type CheckDescriptionWithId } from '../types';

interface CheckResultState {
  isResultOutdated: boolean;
  result: CheckResult | null;
}

@Component({
  selector: 'app-check-calculation-card',
  templateUrl: './check-calculation-card.component.html',
  styleUrls: ['./check-calculation-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  imports: [
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    CheckResultComponent,
  ],
  standalone: true,
})
export class CheckCalculationCardComponent {
  @Input({ required: true }) set skillCheckFormValue(value: CheckDescriptionWithId) {
    this.skillCheckForm.setValue(value, { emitEvent: false });
  }

  @Input() set externalSkillCheckTrigger$(observable: Observable<void>) {
    this.externalSkillCheckDestroy$.next();
    observable.pipe(takeUntil(merge(this.externalSkillCheckDestroy$, this.destroy$))).subscribe(() => {
      this.doCheck();
    });
  }

  @Output() formUpdate: EventEmitter<CheckDescriptionWithId> = new EventEmitter<CheckDescriptionWithId>();
  @Output() remove: EventEmitter<void> = new EventEmitter<void>();
  private readonly externalSkillCheckDestroy$ = new Subject<void>();
  private readonly destroy$ = inject(DestroyService);
  protected checkResultState: WritableSignal<CheckResultState> = signal({
    result: null,
    isResultOutdated: true,
  });

  private readonly skillCheckPerformerService: CheckPerformerService = inject(CheckPerformerService);

  protected skillCheckForm = new FormGroup({
    id: new FormControl<string>(uuidv4(), { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    modifier: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    dc: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.skillCheckForm.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((formValue) => {
        this.formUpdate.emit(formValue as CheckDescriptionWithId);
        this.checkResultState.update((val) => ({ ...val, isResultOutdated: true }));
      });
  }

  protected doCheck(): void {
    const result = this.skillCheckPerformerService.doCheck(
      this.skillCheckForm.controls.modifier.value,
      this.skillCheckForm.controls.dc.value,
    );
    const checkResult = {
      result,
      isResultOutdated: false,
    };
    this.checkResultState.set(checkResult);
  }

  protected doRemove(): void {
    this.remove.emit();
  }
}
