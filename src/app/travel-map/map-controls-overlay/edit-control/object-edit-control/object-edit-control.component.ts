import { ChangeDetectionStrategy, Component, computed, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { distinctUntilChanged, filter, first, map, startWith, switchMap, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../../+state/+module-state';
import { TravelMapObjectsActions, travelMapObjectsFeature } from '../../../+state/travel-map-objects.state';
import { DestroyService } from '../../../../utils/destroy.service';
import { DEFAULT_OBJECT_ICON } from '../../../constants/default-object-icon';
import {
  ICON_TYPE,
  type MapObjectEditState,
  type MapObjectState,
} from '../../../interfaces/map-object-state';
import { MapIconRegistryService, type IconRegistry } from '../../../services/map-icon-registry.service';

@Component({
  selector: 'app-object-edit-control',
  templateUrl: './object-edit-control.component.html',
  styleUrls: ['./object-edit-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class ObjectEditControlComponent {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly mapIconRegistryService: MapIconRegistryService = inject(MapIconRegistryService);
  private readonly destroy$ = inject(DestroyService);
  protected readonly iconTypes: { [key in ICON_TYPE]: string } = {
    [ICON_TYPE.default]: 'Стандартные',
    [ICON_TYPE.building]: 'Здания',
    [ICON_TYPE.creature]: 'Существа',
  };

  protected readonly editObjectState: Signal<MapObjectEditState | null> = this.store.selectSignal(
    travelMapObjectsFeature.selectEditObject,
  );

  protected readonly objectForm = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    color: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<ICON_TYPE>(ICON_TYPE.default, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    icon: new FormControl<string>(DEFAULT_OBJECT_ICON, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly isFormValid: Signal<boolean> = toSignal(
    this.objectForm.statusChanges.pipe(
      startWith(this.objectForm.status),
      map((status) => status === 'VALID'),
    ),
    { requireSync: true },
  );

  protected readonly iconRegistry: Signal<IconRegistry | null> = toSignal(
    this.objectForm.controls.type.valueChanges.pipe(
      distinctUntilChanged(),
      switchMap((type) => this.mapIconRegistryService.getRegistry(type).pipe(startWith(null))),
    ),
    { initialValue: null },
  );

  protected readonly isObjectNotValid: Signal<boolean> = computed(() => !this.isFormValid());

  public constructor() {
    this.store
      .select(travelMapObjectsFeature.selectEditObject)
      .pipe(
        filter((editObjectState): editObjectState is MapObjectEditState => Boolean(editObjectState)),
        takeUntil(this.destroy$),
      )
      .subscribe((editObjectState) => {
        this.objectForm.setValue({
          title: editObjectState.title,
          color: editObjectState.color,
          type: editObjectState.type,
          icon: editObjectState.icon,
        });
      });

    this.objectForm.valueChanges
      .pipe(
        distinctUntilChanged((lhs, rhs) => isEqual(lhs, rhs)),
        takeUntil(this.destroy$),
      )
      .subscribe((editObjectForm) => {
        const editObjectState = this.editObjectState();
        if (editObjectState !== null) {
          this.store.dispatch(
            TravelMapObjectsActions.updateEditObject({
              value: {
                ...editObjectState,
                ...editObjectForm,
              },
            }),
          );
        }
      });
  }

  protected save(): void {
    const editAreaState = this.editObjectState();
    this.store.dispatch(
      TravelMapObjectsActions.updateEditObject({
        value: null,
      }),
    );
    this.store.dispatch(
      TravelMapObjectsActions.upsertObject({
        value: editAreaState as MapObjectState,
      }),
    );
  }

  protected cancel(): void {
    const editObjectState = this.editObjectState();
    if (editObjectState?.id != null) {
      this.store
        .select(travelMapObjectsFeature.selectObjects)
        .pipe(
          first(),
          map((objects) => objects[editObjectState.id as string]),
          takeUntil(this.destroy$),
        )
        .subscribe((originalObjectState) => {
          this.store.dispatch(
            TravelMapObjectsActions.upsertObject({
              value: {
                ...originalObjectState,
                inEdit: false,
              },
            }),
          );
        });
    }
    this.store.dispatch(
      TravelMapObjectsActions.updateEditObject({
        value: null,
      }),
    );
  }
}
