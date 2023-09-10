import { NgModule, isDevMode } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { ActionReducerMap } from '@ngrx/store/src/models';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// set state based on local storage
export function persistStateReducer(_reducer: ActionReducer<{}>) {
  //
  const localStorageKey = '__store_state';
  return (state: {} | undefined, action: Action) => {
    if (state === undefined) {
      const persisted = localStorage.getItem(localStorageKey);
      return persisted ? JSON.parse(persisted) : _reducer(state, action);
    }

    const nextState = _reducer(state, action);
    localStorage.setItem(localStorageKey, JSON.stringify(nextState));
    return nextState;
  };
}

// reset the whole state via the action's payload
export function updateStateReducer(_reducer: ActionReducer<{}>) {
  return (state: {} | undefined, action: Action) => {
    if (action.type === 'LOAD_STORE_STATE') {
      return (<any>action).payload.newState;
    }

    return _reducer(state, action);
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({} as ActionReducerMap<unknown>, {
      metaReducers: [persistStateReducer, updateStateReducer],
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    MatButtonModule,
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
