import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CHECK_RESULT,
  SkillCheckPerformerService,
  SkillCheckResult,
} from '../../shared/skill-check-performer.service';
import { DestroyService } from '../../utils/destroy.service';

export enum CHECK_RESULT_COLOR {
  CRIT_SUCCESS = 'green',
  SUCCESS = 'greenyellow',
  FAIL = 'orange',
  CRIT_FAIL = 'red',
}

export interface ResultInterpretation {
  label: string;
  color: CHECK_RESULT_COLOR;
}

export const CHECK_RESULT_INTERPRETATION: { [key in CHECK_RESULT]: ResultInterpretation } = {
  [CHECK_RESULT.CRIT_SUCCESS]: {
    label: 'Критический успех',
    color: CHECK_RESULT_COLOR.CRIT_SUCCESS,
  },
  [CHECK_RESULT.SUCCESS]: {
    label: 'Успех',
    color: CHECK_RESULT_COLOR.SUCCESS,
  },
  [CHECK_RESULT.FAIL]: {
    label: 'Провал',
    color: CHECK_RESULT_COLOR.FAIL,
  },
  [CHECK_RESULT.CRIT_FAIL]: {
    label: 'Критический провал',
    color: CHECK_RESULT_COLOR.CRIT_FAIL,
  },
};

type CampingCheckResult = {
  isResultOutdated: boolean;
  result: (SkillCheckResult & { resultInterpretation: ResultInterpretation }) | null;
};

export interface SkillCheckFormValue {
  id: string;
  title: string;
  modifier: number;
  dc: number;
}

@Component({
  selector: 'app-camping-check-calculation',
  templateUrl: './camping-check-calculation.component.html',
  styleUrls: ['./camping-check-calculation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class CampingCheckCalculationComponent {
  @Input({ required: true }) set skillCheckFormValue(value: SkillCheckFormValue) {
    this.skillCheckForm.setValue(value, { emitEvent: false });
  }
  @Output() formUpdate: EventEmitter<SkillCheckFormValue> = new EventEmitter<SkillCheckFormValue>();
  @Output() remove: EventEmitter<void> = new EventEmitter<void>();
  private destroy$ = inject(DestroyService);
  protected checkResult: WritableSignal<CampingCheckResult> = signal({
    result: null,
    isResultOutdated: true,
  });
  private skillCheckPerformerService: SkillCheckPerformerService = inject(SkillCheckPerformerService);

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
        this.formUpdate.emit(formValue as SkillCheckFormValue);
        this.checkResult.update((val) => ({ ...val, isResultOutdated: true }));
      });
  }

  protected doCheck() {
    const result = this.skillCheckPerformerService.checkSkill(
      this.skillCheckForm.controls.modifier.value,
      this.skillCheckForm.controls.dc.value,
    );
    const checkResult = {
      result: {
        ...result,
        resultInterpretation: CHECK_RESULT_INTERPRETATION[result.checkResult],
      },
      isResultOutdated: false,
    };
    this.checkResult.set(checkResult);
  }

  protected doRemove(): void {
    this.remove.emit();
  }
}
