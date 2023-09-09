import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceRollerService } from './dice-roller.service';
import { SkillCheckPerformerService } from './skill-check-performer.service';

@NgModule({
  providers: [DiceRollerService, SkillCheckPerformerService],
  imports: [CommonModule],
})
export class SharedModule {}
