# KingmakerTools

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

1. Open route
2. Load data from Server + store server data in local storage SERVER_DATA_VAR
3. Merge ServerData/StoreState
   - To avoid merge we could treat server as a single source of truth
     1. Open route, load data from server and simply accept it as is
     2. When user edits data in app, we mutate state locally and send to server changes as NgRx Actions (or some other format) with timestamp
        - We should send only actions for actual state, not edit state or inEdit attribute
     3. Server applies Actions to its state copy and sends its new state back to App.
     4. If we have no connection, we store actions in queue and send it ASAP (at worst - on application start some time later before loading server state)
     5. We still could have situation when actions sent to server are outdated (operation from 1 week ago applied to an object that was modified yesterday or removed completely)
        - In such case we can (1) ignore outdated actions or(2)check for conflicts and apply non-conflicting actions
        - For now choose (1) because (2) is more complex
4. Update state in store
5. Upload state to server

Tricky bit: App should be able to work offline, preserve changes made offline and send it to the server once online.
To do so, during the step 3 we check diff between StoreState/SERVER_DATA_VAR and ServerData/SERVER_DATA_VAR
Then we apply non-conflicting changes and ask user to resolve conflicts
