import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { campingChecksCalculationFeature } from './+state/camping-checks-calculation.state';
import { CampingCheckCalculationComponent } from './camping-check-calculation/camping-check-calculation.component';
import { CampingChecksCalculationComponent } from './camping-checks-calculation/camping-checks-calculation.component';

@NgModule({
  imports: [
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: CampingChecksCalculationComponent }]),
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    MatChipsModule,
    StoreModule.forFeature(campingChecksCalculationFeature),
    MatTooltipModule,
  ],
  declarations: [CampingCheckCalculationComponent, CampingChecksCalculationComponent],
  exports: [RouterModule],
})
export class CampingChecksCalculationModule {}
