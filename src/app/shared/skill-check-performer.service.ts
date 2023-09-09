import { inject, Injectable } from '@angular/core';
import { DICE_TYPE, DiceRollerService } from './dice-roller.service';

export enum SKILL_CHECK_RESULT {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}
@Injectable({
  providedIn: 'root',
})
export class SkillCheckPerformerService {
  private readonly diceRollerService: DiceRollerService = inject(DiceRollerService);

  public checkSkill(modifier: number, targetDC: number): { result: SKILL_CHECK_RESULT; rollResult: number } {
    const rollResult = this.diceRollerService.rollDiceWithModifier(DICE_TYPE.D20, modifier);
    return {
      result: rollResult >= targetDC ? SKILL_CHECK_RESULT.SUCCESS : SKILL_CHECK_RESULT.FAIL,
      rollResult,
    };
  }
}
