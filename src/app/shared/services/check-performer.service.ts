import { inject, Injectable } from '@angular/core';
import { CHECK_RESULT } from '../constants';
import { DICE_TYPE, DiceRollerService, type DiceRollWithModifierResult } from './dice-roller.service';

export type CheckResult = DiceRollWithModifierResult & { targetDC: number; checkResult: CHECK_RESULT };

export interface DoCheckOptions {
  critSuccessRange: [number, number];
  critFailureRange: [number, number];
}

@Injectable({
  providedIn: 'root',
})
export class CheckPerformerService {
  private readonly diceRollerService: DiceRollerService = inject(DiceRollerService);

  public doCheck(
    modifier: number,
    targetDC: number,
    options: DoCheckOptions = { critSuccessRange: [20, 20], critFailureRange: [1, 1] },
  ): CheckResult {
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

    if (
      rollResult.rollRaw >= options.critSuccessRange[0] &&
      rollResult.rollRaw <= options.critSuccessRange[1] &&
      checkResult !== CHECK_RESULT.CRIT_SUCCESS
    ) {
      checkResult--;
    } else if (
      rollResult.rollRaw >= options.critFailureRange[0] &&
      rollResult.rollRaw <= options.critFailureRange[1] &&
      checkResult !== CHECK_RESULT.CRIT_FAIL
    ) {
      checkResult++;
    }

    return {
      checkResult,
      targetDC,
      ...rollResult,
    };
  }
}
