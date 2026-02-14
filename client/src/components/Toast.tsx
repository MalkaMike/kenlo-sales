import { useContext } from "react";
import { NotificationContext } from "@/contexts/NotificationContext";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const typeStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
    title: "text-green-900",
    message: "text-green-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-600",
    title: "text-red-900",
    message: "text-red-700",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    title: "text-yellow-900",
    message: "text-yellow-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
    title: "text-blue-900",
    message: "text-blue-700",
  },
};

export function Toast() {
  const context = useContext(NotificationContext);

  if (!context) return null;

  const { notifications, removeNotification } = context;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md pointer-events-none">
      {notifications.map((notification) => {
        const styles = typeStyles[notification.type];
        const Icon = styles.icon;

        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto`}
          >
            <div className="flex gap-3">
              <Icon className={`${styles.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <h3 className={`${styles.title} font-semibold text-sm`}>{notification.title}</h3>
                {notification.message && (
                  <p className={`${styles.message} text-sm mt-1`}>{notification.message}</p>
                )}
                {notification.action && (
                  <button
                    onClick={() => {
                      notification.action?.onClick();
                      removeNotification(notification.id);
                    }}
                    className={`${styles.message} text-sm font-medium mt-2 hover:underline`}
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className={`${styles.iconColor} flex-shrink-0 hover:opacity-70 transition-opacity`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
