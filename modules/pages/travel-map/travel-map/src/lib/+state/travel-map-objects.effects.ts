import { inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, filter, map, type Observable } from 'rxjs';
import { ConfirmComponent, type ConfirmComponentData } from 'shared_confirm-component';
import { TouchUiService } from 'shared_touch-ui-service';
import { TravelMapObjectsActions } from './travel-map-objects.state';

export const confirmDeleteObject = createEffect(
  (
    actions$ = inject(Actions),
    matBottomSheet: MatBottomSheet = inject(MatBottomSheet),
    matDialog: MatDialog = inject(MatDialog),
    touchUiService: TouchUiService = inject(TouchUiService),
  ) => {
    return actions$.pipe(
      ofType(TravelMapObjectsActions.confirmDeleteObject),
      exhaustMap((action) => {
        let isConfirmed$: Observable<boolean | undefined>;
        const data: ConfirmComponentData = {
          title: `Подтвердите удаление объекта`,
          description: `Вы действительно хотите удалить объект ${action.value.title}?`,
        };
        if (touchUiService.isTouchUI()) {
          const ref = matBottomSheet.open<ConfirmComponent, ConfirmComponentData, boolean>(ConfirmComponent, {
            data,
          });
          isConfirmed$ = ref.afterDismissed();
        } else {
          const ref = matDialog.open<ConfirmComponent, ConfirmComponentData, boolean>(ConfirmComponent, {
            data,
          });
          isConfirmed$ = ref.afterClosed();
        }
        return isConfirmed$.pipe(
          filter((isConfirmed: boolean | undefined) => Boolean(isConfirmed)),
          map(() => TravelMapObjectsActions.doDeleteObject({ value: action.value })),
        );
      }),
    );
  },
  { functional: true },
);
