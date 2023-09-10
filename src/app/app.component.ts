import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { from, takeUntil } from 'rxjs';
import { DestroyService } from './utils/destroy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DestroyService],
})
export class AppComponent {
  protected store = inject(Store);
  protected destroy$ = inject(DestroyService);

  constructor() {
    //JSON.parse(localStorage.getItem('state'))
    if (navigator.storage && navigator.storage.persist) {
      from(navigator.storage.persist())
        .pipe(takeUntil(this.destroy$))
        .subscribe((isPersisted) => {
          console.log(`Persisted storage granted: ${isPersisted}`);
        });
    }

    /*this.store.pipe(debounceTime(1000),takeUntil(this.destroy$)).subscribe((state)=>{
      localStorage.setItem('state', JSON.stringify(state));
    })*/
  }
}
