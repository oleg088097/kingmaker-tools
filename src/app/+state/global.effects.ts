import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounceTime, filter, first, map, switchMap, tap } from 'rxjs';
import { GlobalActions } from './global.actions';
interface AppStateVersioned {
  version: number;
  state: Record<string, unknown>;
}

const CURRENT_STATE_VERSION = 2;
const STATE_STORAGE_KEY = '__store_state';

function migrateState(state: AppStateVersioned): AppStateVersioned {
  switch (state.version) {
    case 1: {
      state.state['campingChecks'] = state.state['campingCalculation'];
    }
  }
  return state;
}

@Injectable()
export class GlobalEffects {
  private actions$: Actions = inject(Actions);
  private store: Store<Record<string, unknown>> = inject(Store);
  private persistState: boolean = false;

  updatePersistState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GlobalActions.activateStatePersistance),
        tap(() => (this.persistState = true)),
      ),
    { dispatch: false },
  );

  persistState$ = createEffect(
    () =>
      this.actions$.pipe(
        filter(() => this.persistState),
        debounceTime(500),
        switchMap(() => this.store.pipe(first())),
        tap((value: Record<string, unknown>) => saveStateToLocalStorage(value)),
      ),
    { dispatch: false },
  );

  loadStoreStateFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.loadStoreStateFromLocalStorage),
      map(() => {
        const globalState = loadStateFromLocalStorage();
        if (globalState) {
          return GlobalActions.loadStoreState({ globalState: migrateState(globalState).state });
        } else {
          return GlobalActions.activateStatePersistance();
        }
      }),
    ),
  );

  loadStoreState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.loadStoreState),
      map(() => GlobalActions.activateStatePersistance()),
    ),
  );
}

function saveStateToLocalStorage(state: Record<string, unknown>): void {
  const appStateSerialized: AppStateVersioned = {
    version: CURRENT_STATE_VERSION,
    state,
  };
  localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(appStateSerialized));
}

function loadStateFromLocalStorage(): AppStateVersioned | null {
  const persisted = localStorage.getItem(STATE_STORAGE_KEY);
  const parsedData: AppStateVersioned | unknown = persisted ? JSON.parse(persisted) : null;
  return (parsedData as AppStateVersioned)?.version ? (parsedData as AppStateVersioned) : null;
}
