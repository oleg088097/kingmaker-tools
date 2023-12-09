import { moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { type CampingCalculationModuleState } from '../../../+state/+module-state';
import { WatchChecksActions, watchChecksFeature } from '../../../+state/watch-checks.state';
import { DestroyService } from '../../../../utils/destroy.service';
import { type CampingCalculationDataWatchCheck } from '../../../interfaces/camping-calculation-data';

@Component({
  selector: 'app-watch-checks-list-edit',
  templateUrl: './watch-checks-list-edit.component.html',
  styleUrls: ['./watch-checks-list-edit.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchChecksListEditComponent {
  protected store: Store<CampingCalculationModuleState> = inject(Store);
  protected destroy$ = inject(DestroyService);

  protected watchChecksStateChecks: Signal<CampingCalculationDataWatchCheck[]> = toSignal(
    this.store.select(watchChecksFeature.selectChecks).pipe(takeUntil(this.destroy$)),
    {
      requireSync: true,
    },
  );

  protected onTitleChange(check: CampingCalculationDataWatchCheck, event: Event): void {
    this.store.dispatch(
      WatchChecksActions.updateCheck({
        value: {
          ...check,
          title: (event.target as HTMLInputElement).value,
        },
      }),
    );
  }

  protected onRemoveElement(check: CampingCalculationDataWatchCheck): void {
    this.store.dispatch(
      WatchChecksActions.updateChecks({
        checks: this.watchChecksStateChecks().filter((el) => el.id !== check.id),
      }),
    );
  }

  protected onAddElement(): void {
    this.store.dispatch(
      WatchChecksActions.updateChecks({
        checks: [
          ...this.watchChecksStateChecks(),
          {
            id: uuidv4(),
            title: 'Новый персонаж',
            modifier: 0,
            disabled: false,
          },
        ],
      }),
    );
  }

  protected onOrderChange(event: CdkDragDrop<unknown, any>): void {
    const shallowClone = [...this.watchChecksStateChecks()];
    moveItemInArray(shallowClone, event.previousIndex, event.currentIndex);
    this.store.dispatch(
      WatchChecksActions.updateChecks({
        checks: shallowClone,
      }),
    );
  }
}
