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

// For global migrations
// specific reducer should use its version field to migrate in GlobalActions.loadStoreState handler
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
  private readonly actions$: Actions = inject<Actions>(Actions);
  private readonly store: Store<Record<string, unknown>> = inject<Store<Record<string, unknown>>>(Store);
  private persistState = false;

  activateStatePersistence$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GlobalActions.activateStatePersistence),
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
        tap((value: Record<string, unknown>) => {
          saveStateToLocalStorage(value);
        }),
      ),
    { dispatch: false },
  );

  loadStoreStateFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.loadStoreStateFromLocalStorage),
      map(() => {
        const globalState = loadStateFromLocalStorage();
        if (globalState != null) {
          return GlobalActions.loadStoreState({ globalState: migrateState(globalState).state });
        } else {
          return GlobalActions.activateStatePersistence();
        }
      }),
    ),
  );

  loadStoreState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.loadStoreState),
      map(() => GlobalActions.activateStatePersistence()),
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
  const parsedData: AppStateVersioned | null =
    persisted != null && persisted !== '' ? (JSON.parse(persisted) as AppStateVersioned) : null;
  return parsedData?.version != null ? parsedData : null;
}
