import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { CheckResultComponent } from '../shared/components/check-result/check-result.component';
import { campingChecksFeature } from './+state/camping-checks.state';
import { randomEncounterCheckFeature } from './+state/random-encounter-check.state';
import { watchChecksFeature } from './+state/watch-checks.state';
import { CampingCalculationComponent } from './camping-calculation/camping-calculation.component';
import { CampingChecksComponent } from './camping-calculation/camping-checks/camping-checks.component';
import { RandomEncounterCheckComponent } from './camping-calculation/random-encounter-check/random-encounter-check.component';
import { WatchChecksListEditComponent } from './camping-calculation/watch-checks/watch-checks-list-edit/watch-checks-list-edit.component';
import { WatchChecksComponent } from './camping-calculation/watch-checks/watch-checks.component';

@NgModule({
  imports: [
    MatInputModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: CampingCalculationComponent }]),
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    MatChipsModule,
    StoreModule.forFeature(campingChecksFeature),
    StoreModule.forFeature(randomEncounterCheckFeature),
    StoreModule.forFeature(watchChecksFeature),
    MatTooltipModule,
    MatTableModule,
    CheckResultComponent,
    HttpClientModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatListModule,
    CdkDropList,
    CdkDrag,
  ],
  declarations: [
    CampingCalculationComponent,
    CampingChecksComponent,
    WatchChecksComponent,
    RandomEncounterCheckComponent,
    WatchChecksListEditComponent,
  ],
  exports: [RouterModule],
})
export class CampingCalculationModule {}
