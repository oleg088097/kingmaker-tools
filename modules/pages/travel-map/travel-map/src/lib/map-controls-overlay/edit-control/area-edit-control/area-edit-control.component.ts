import { ChangeDetectionStrategy, Component, computed, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged, filter, first, map, startWith, takeUntil } from 'rxjs';
import { DestroyService } from 'shared_destroy-service';
import { type TravelMapModuleState } from '../../../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../../../+state/travel-map-areas.state';
import { type MapAreaEditState, type MapAreaState } from '../../../interfaces/map-area-state';

@Component({
  selector: 'app-area-edit-control',
  templateUrl: './area-edit-control.component.html',
  styleUrls: ['./area-edit-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class AreaEditControlComponent {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly destroy$ = inject(DestroyService);

  protected readonly editAreaState: Signal<MapAreaEditState | null> = this.store.selectSignal(
    travelMapAreasFeature.selectEditArea,
  );

  protected readonly areaForm = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    color: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly isFormValid: Signal<boolean> = toSignal(
    this.areaForm.statusChanges.pipe(
      startWith(this.areaForm.status),
      map((status) => status === 'VALID'),
    ),
    { requireSync: true },
  );

  protected readonly isAreaNotValid: Signal<boolean> = computed(
    () =>
      !this.isFormValid() ||
      this.editAreaState()?.meshElementIds == null ||
      this.editAreaState()?.meshElementIds?.length === 0,
  );

  public constructor() {
    this.store
      .select(travelMapAreasFeature.selectEditArea)
      .pipe(
        filter((editAreaState): editAreaState is MapAreaEditState => Boolean(editAreaState)),
        takeUntil(this.destroy$),
      )
      .subscribe((editAreaState) => {
        this.areaForm.setValue({
          title: editAreaState.title,
          color: editAreaState.color,
        });
      });

    this.areaForm.valueChanges
      .pipe(
        distinctUntilChanged((lhs, rhs) => isEqual(lhs, rhs)),
        takeUntil(this.destroy$),
      )
      .subscribe((editAreaForm) => {
        const editAreaState = this.editAreaState();
        if (editAreaState !== null) {
          this.store.dispatch(
            TravelMapAreasActions.updateEditArea({
              value: {
                ...editAreaState,
                ...editAreaForm,
              },
            }),
          );
        }
      });
  }

  protected save(): void {
    const editAreaState = this.editAreaState();
    this.store.dispatch(
      TravelMapAreasActions.updateEditArea({
        value: null,
      }),
    );
    this.store.dispatch(
      TravelMapAreasActions.upsertArea({
        value: editAreaState as MapAreaState,
      }),
    );
  }

  protected cancel(): void {
    const editAreaState = this.editAreaState();
    if (editAreaState?.id != null) {
      this.store
        .select(travelMapAreasFeature.selectAreas)
        .pipe(
          first(),
          map((areas) => areas[editAreaState.id!]),
          takeUntil(this.destroy$),
        )
        .subscribe((originalAreaState) => {
          this.store.dispatch(
            TravelMapAreasActions.upsertArea({
              value: {
                ...originalAreaState,
                inEdit: false,
              },
            }),
          );
        });
    }
    this.store.dispatch(
      TravelMapAreasActions.updateEditArea({
        value: null,
      }),
    );
  }
}
