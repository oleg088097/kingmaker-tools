import { Injectable } from '@angular/core';

export enum DICE_TYPE {
  D4 = 4,
  D6 = 6,
  D8 = 8,
  D10 = 10,
  D12 = 12,
  D20 = 20,
}
@Injectable({
  providedIn: 'root',
})
export class DiceRollerService {
  public rollDice(diceType: DICE_TYPE): number {
    return Math.ceil(Math.random() * diceType);
  }

  public rollDiceWithModifier(diceType: DICE_TYPE, modifier: number): number {
    return this.rollDice(diceType) + modifier;
  }
}
