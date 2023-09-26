import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { CheckResultComponent } from '../shared/components/check-result/check-result.component';
import { campingCalculationFeature } from './+state/camping-calculation.state';
import { CampingCalculationComponent } from './camping-calculation/camping-calculation.component';

@NgModule({
  imports: [
    MatInputModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: CampingCalculationComponent }]),
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    StoreModule.forFeature(campingCalculationFeature),
    MatTooltipModule,
    MatTableModule,
    CheckResultComponent,
    HttpClientModule,
    MatProgressSpinnerModule,
  ],
  declarations: [CampingCalculationComponent],
  exports: [RouterModule],
})
export class CampingCalculationModule {}
