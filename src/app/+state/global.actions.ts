import { createAction, createActionGroup, emptyProps, props, UPDATE } from '@ngrx/store';

type GlobalState = unknown;
export interface LoadStoreStatePayload {
  globalState: GlobalState;
}

export const UPDATE_ACTION_CREATOR = createAction(UPDATE);
export const GlobalActions = createActionGroup({
  source: 'Global',
  events: {
    activateStatePersistence: emptyProps(),
    // Can use GlobalActions.loadStoreState in specific reducer to migrate state via version field of that specific reducer state
    loadStoreState: props<LoadStoreStatePayload>(),
    loadStoreStateFromLocalStorage: emptyProps(),
  },
});
