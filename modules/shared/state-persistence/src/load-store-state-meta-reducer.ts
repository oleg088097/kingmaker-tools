import { type Action, type ActionReducer, type MetaReducer } from '@ngrx/store';
import { GlobalActions, type LoadStoreStatePayload } from './global.actions';

export const loadStoreStateMetaReducer: MetaReducer = (_reducer: ActionReducer<unknown>) => {
  return (state: unknown, action: Action) => {
    // Can use GlobalActions.loadStoreState and UPDATE_ACTION_CREATOR in specific reducer to migrate state via version field of that specific reducer state
    if (action.type === GlobalActions.loadStoreState.type) {
      return _reducer((action as Action & LoadStoreStatePayload).globalState, action);
    }

    return _reducer(state, action);
  };
};
