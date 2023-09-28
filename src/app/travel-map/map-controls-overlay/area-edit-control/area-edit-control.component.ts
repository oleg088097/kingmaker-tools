import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { distinctUntilChanged, first, map, startWith, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { DestroyService } from '../../../utils/destroy.service';
import { type MapAreaState } from '../../interfaces/map-area-state';

@Component({
  selector: 'app-area-edit-control',
  templateUrl: './area-edit-control.component.html',
  styleUrls: ['./area-edit-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class AreaEditControlComponent {
  private readonly store: Store<TravelMapModuleState> = inject(Store);
  private readonly destroy$ = inject(DestroyService);
  protected readonly isHideDisplayControls: WritableSignal<boolean> = signal(false);
  /*
  protected readonly isTouchUI: Signal<boolean> = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767px)')
      .pipe(map((breakpoint) => breakpoint.matches)),
    { requireSync: true },
  );
  */

  protected readonly editAreaState: Signal<Partial<MapAreaState> | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
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

  protected readonly isFormNotValid: Signal<boolean> = toSignal(
    this.areaForm.statusChanges.pipe(
      startWith(this.areaForm.status),
      map((status) => status !== 'VALID'),
    ),
    { requireSync: true },
  );

  public constructor() {
    effect(() => {
      const editAreaState = this.editAreaState();
      if (editAreaState != null) {
        untracked(() => {
          this.areaForm.setValue({
            title: editAreaState.title ?? '',
            color: editAreaState.color ?? `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          });
        });
      }
    });

    this.areaForm.valueChanges
      .pipe(
        distinctUntilChanged((lhs, rhs) => isEqual(lhs, rhs)),
        takeUntil(this.destroy$),
      )
      .subscribe((editAreaForm) => {
        this.store.dispatch(
          TravelMapAreasActions.updateEditArea({
            value: {
              ...this.editAreaState(),
              ...editAreaForm,
            },
          }),
        );
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
          map((areas) => areas[editAreaState.id as string]),
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
