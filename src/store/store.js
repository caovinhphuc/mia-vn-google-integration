import { applyMiddleware, combineReducers, createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";

// Import reducers
import alertsReducer from "./reducers/alertsReducer";
import authReducer from "./reducers/authReducer";
import dashboardReducer from "./reducers/dashboardReducer";
import driveReducer from "./reducers/driveReducer";
import sheetsReducer from "./reducers/sheetsReducer";

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "dashboard"], // Only persist these reducers
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  sheets: sheetsReducer,
  drive: driveReducer,
  dashboard: dashboardReducer,
  alerts: alertsReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = createStore(persistedReducer, applyMiddleware(thunk));

// Create persistor
export const persistor = persistStore(store);

export default store;
