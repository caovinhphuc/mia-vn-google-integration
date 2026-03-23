// Remove the duplicate declaration of NotificationContainer
// Ensure only one definition of NotificationContainer exists in this file

import React, { useState } from "react";
import { NotificationContainer as ReactNotificationContainer } from "react-notifications";

export const NotificationContainer = () => {
  return <ReactNotificationContainer />;
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return { notifications, addNotification, removeNotification };
};
