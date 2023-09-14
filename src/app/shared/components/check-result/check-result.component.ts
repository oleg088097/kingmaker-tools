import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DestroyService } from '../../../utils/destroy.service';
import { CHECK_RESULT_INTERPRETATION, CheckResultInterpretation } from '../../constants';
import { CheckResult } from '../../services';

@Component({
  selector: 'app-check-result',
  templateUrl: './check-result.component.html',
  styleUrls: ['./check-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  imports: [
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    NgIf,
  ],
  standalone: true,
})
export class CheckResultComponent {
  @Input() checkResult?: CheckResult;
  @Input() isResultOutdated?: boolean;

  protected getInterpretation(): CheckResultInterpretation | null {
    return this.checkResult ? CHECK_RESULT_INTERPRETATION[this.checkResult.checkResult] : null;
  }
}
