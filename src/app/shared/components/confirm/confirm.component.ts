import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface ConfirmComponentData {
  title: string;
  description: string;
  okButton?: string;
  cancelButton?: string;
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  standalone: true,
})
export class ConfirmComponent {
  private readonly defaultDialogData: ConfirmComponentData = {
    title: 'Подтвердите',
    description: 'Вы действительно хотите выполнить эту операцию?',
    okButton: 'Подтвердить',
    cancelButton: 'Отменить',
  };

  private readonly dialogData = inject<ConfirmComponentData>(MAT_DIALOG_DATA, { optional: true });
  private readonly bottomSheetData = inject<ConfirmComponentData>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  });

  protected readonly data: ConfirmComponentData = Object.assign(
    {},
    this.defaultDialogData,
    this.dialogData ?? this.bottomSheetData ?? {},
  );

  private readonly dialogRef = inject<MatDialogRef<ConfirmComponent>>(MatDialogRef, { optional: true });
  private readonly bottomSheetRef = inject<MatBottomSheetRef<ConfirmComponent>>(MatBottomSheetRef, {
    optional: true,
  });

  protected close(result: boolean): void {
    if (this.dialogRef != null) {
      this.dialogRef.close(result);
    } else if (this.bottomSheetRef != null) {
      this.bottomSheetRef.dismiss(result);
    }
  }
}
