import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { DestroyService } from '../../../utils/destroy.service';
import { CHECK_RESULT_INTERPRETATION, type CheckResultInterpretation } from '../../constants';
import { type CheckResult } from '../../services';

@Component({
  selector: 'app-check-result',
  templateUrl: './check-result.component.html',
  styleUrls: ['./check-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  imports: [MatChipsModule, NgIf],
  standalone: true,
})
export class CheckResultComponent {
  @Input() checkResult?: CheckResult;
  @Input() isResultOutdated?: boolean;

  protected getInterpretation(): CheckResultInterpretation | null {
    return this.checkResult != null ? CHECK_RESULT_INTERPRETATION[this.checkResult.checkResult] : null;
  }
}
