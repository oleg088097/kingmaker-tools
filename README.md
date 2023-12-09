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
4. Update state in store
5. Upload state to server

Tricky bit: App should be able to work offline, preserve changes made offline and send it to the server once online.
To do so, during the step 3 we check diff between StoreState/SERVER_DATA_VAR and ServerData/SERVER_DATA_VAR
Then we apply non-conflicting changes and ask user to resolve conflicts
