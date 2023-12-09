import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TouchUiService {
  public readonly isTouchUI: Signal<boolean> = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767px)')
      .pipe(map((breakpoint) => breakpoint.matches)),
    { requireSync: true },
  );
}
