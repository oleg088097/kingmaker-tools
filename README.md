# KingmakerTools

TODO

- hammerjs zoom gesture for map scale control

# Data Flow

## Initial app load

1. Load App
2. Load State from Local Storage
3. Migrate State
4. Update state in store

## Load specific feature route

1. Open route
2. Load Seed data
3. Merge Seed/StoreState
4. Update state in store

### If move to server-side storage

1. Open route, load data from server and simply accept it as is
2. When user edits data in app, we mutate state locally and send to server changes as NgRx Actions (or some other format) with timestamp
   - We should send only actions for actual state, not edit state or inEdit attribute
3. Server applies Actions to its state copy and sends its new state back to App.
4. If we have no connection, we store actions in queue and send it ASAP (at worst - on application start some time later before loading server state)
5. We still could have situation when actions sent to server are outdated (operation from 1 week ago applied to an object that was modified yesterday or removed completely)
   - In such case we can (1) ignore outdated actions or(2)check for conflicts and apply non-conflicting actions
   - For now choose (1) because (2) is more complex
