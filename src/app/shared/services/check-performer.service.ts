import { inject, Injectable } from '@angular/core';
import { CHECK_RESULT } from '../constants/check-result';
import { DICE_TYPE, DiceRollerService, DiceRollWithModifierResult } from './dice-roller.service';

export type CheckResult = DiceRollWithModifierResult & { checkResult: CHECK_RESULT };

@Injectable({
  providedIn: 'root',
})
export class CheckPerformerService {
  private readonly diceRollerService: DiceRollerService = inject(DiceRollerService);

  public checkSkill(modifier: number, targetDC: number): CheckResult {
    const rollResult = this.diceRollerService.rollDiceWithModifier(DICE_TYPE.D20, modifier);
    let checkResult: CHECK_RESULT;
    if (rollResult.rollTotal >= targetDC + 10) {
      checkResult = CHECK_RESULT.CRIT_SUCCESS;
    } else if (rollResult.rollTotal >= targetDC) {
      checkResult = CHECK_RESULT.SUCCESS;
    } else if (rollResult.rollTotal >= targetDC - 10) {
      checkResult = CHECK_RESULT.FAIL;
    } else {
      checkResult = CHECK_RESULT.CRIT_FAIL;
    }

    if (rollResult.rollRaw === 20 && checkResult !== CHECK_RESULT.CRIT_SUCCESS) {
      checkResult--;
    } else if (rollResult.rollRaw === 1 && checkResult !== CHECK_RESULT.CRIT_FAIL) {
      checkResult++;
    }

    return {
      checkResult,
      ...rollResult,
    };
  }
}
