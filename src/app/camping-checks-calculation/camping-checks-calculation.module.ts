import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampingCheckCalculationComponent } from './camping-check-calculation/camping-check-calculation.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [CampingCheckCalculationComponent],
  imports: [CommonModule, MatInputModule, MatButtonModule],
})
export class CampingChecksCalculationModule {}
