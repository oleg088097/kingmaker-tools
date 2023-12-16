import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { from, takeUntil } from 'rxjs';
import { GlobalActions } from './+state/global.actions';
import { DestroyService } from './utils/destroy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected store = inject(Store);
  protected destroy$ = inject(DestroyService);

  constructor() {
    this.store.dispatch(GlobalActions.loadStoreStateFromLocalStorage());
    // no navigator fo safari ~14, migrate to IndexedDb?
    if (navigator?.storage != null) {
      from(navigator.storage.persist())
        .pipe(takeUntil(this.destroy$))
        .subscribe((isPersisted) => {
          console.log(`Persisted storage granted: ${String(isPersisted)}`);
        });
    }
  }
}
