import { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { GlobalActions, LoadStoreStatePayload } from './global.actions';

export const loadStoreStateMetaReducer: MetaReducer = (_reducer: ActionReducer<{}>) => {
  return (state: {} | undefined, action: Action) => {
    if (action.type === GlobalActions.loadStoreState.type) {
      return (action as Action & LoadStoreStatePayload).globalState;
    }

    return _reducer(state, action);
  };
};
