import { createActionGroup, emptyProps, props } from '@ngrx/store';

type GlobalState = unknown;
export interface LoadStoreStatePayload {
  globalState: GlobalState;
}

export const GlobalActions = createActionGroup({
  source: 'Global',
  events: {
    activateStatePersistance: emptyProps(),
    loadStoreState: props<LoadStoreStatePayload>(),
    loadStoreStateFromLocalStorage: emptyProps(),
  },
});
