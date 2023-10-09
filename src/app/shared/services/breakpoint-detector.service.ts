import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreakpointDetectorService {
  private breakpointObserver = inject(BreakpointObserver);

  public observeBreakpoint(value: string | readonly string[]): Observable<boolean> {
    return this.breakpointObserver.observe(value).pipe(map((breakpoint) => breakpoint.matches));
  }
}
