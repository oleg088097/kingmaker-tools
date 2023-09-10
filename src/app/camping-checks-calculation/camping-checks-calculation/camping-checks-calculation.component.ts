import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map, takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { CampingChecksCalculationModuleState } from '../+state/+module-state';
import {
  CampingChecksCalculationActions,
  campingChecksCalculationFeature,
} from '../+state/camping-checks-calculation.state';
import { DestroyService } from '../../utils/destroy.service';
import { SkillCheckFormValue } from '../camping-check-calculation/camping-check-calculation.component';

@Component({
  selector: 'app-camping-checks-calculation',
  templateUrl: './camping-checks-calculation.component.html',
  styleUrls: ['./camping-checks-calculation.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampingChecksCalculationComponent {
  protected destroy$ = inject(DestroyService);
  protected store: Store<CampingChecksCalculationModuleState> = inject(Store);
  protected checksState: Signal<SkillCheckFormValue[]> = toSignal(
    this.store.select(campingChecksCalculationFeature.name).pipe(
      map((state) => state.checks),
      takeUntil(this.destroy$),
    ),
    { initialValue: [] },
  );

  protected addCheck() {
    this.store.dispatch(
      CampingChecksCalculationActions.add({
        value: {
          id: uuidv4(),
          title: 'Проверка',
          modifier: 0,
          dc: 20,
        },
      }),
    );
  }

  protected doRemove(index: number): void {
    this.store.dispatch(
      CampingChecksCalculationActions.remove({
        index,
      }),
    );
  }

  protected doUpdate(value: SkillCheckFormValue, index: number): void {
    this.store.dispatch(
      CampingChecksCalculationActions.update({
        value,
        index,
      }),
    );
  }
  protected trackBy(index: number, value: SkillCheckFormValue): string {
    return value.id;
  }
}
