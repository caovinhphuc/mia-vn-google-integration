import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { dispatchSWUpdate } from "./utils/swUpdateEvent";

const App = lazy(() => import(/* webpackChunkName: "app-root" */ "./App"));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div className="mia-app-boot-fallback">Đang tải...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);

// Register service worker for PWA capabilities
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log("✅ Service Worker registered. App ready for offline use.");
  },
  onUpdate: (registration) => {
    console.log("🔄 New version available.");
    dispatchSWUpdate(registration);
  },
});
