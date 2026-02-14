import { useContext } from "react";
import { NotificationContext, type Notification, type NotificationType } from "@/contexts/NotificationContext";

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  const { addNotification, removeNotification, clearNotifications } = context;

  return {
    notify: (
      type: NotificationType,
      title: string,
      message?: string,
      options?: { duration?: number; action?: Notification["action"] }
    ) => {
      return addNotification({
        type,
        title,
        message,
        duration: options?.duration,
        action: options?.action,
      });
    },
    success: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "success", title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "error", title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "warning", title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "info", title, message, duration }),
    remove: removeNotification,
    clear: clearNotifications,
  };
}
