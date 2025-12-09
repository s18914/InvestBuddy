import { Link } from "react-router-dom";
import { useAlerts, Alert, AlertType } from "@/hooks/useAlerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

const alertStyles: Record<
  AlertType,
  { bg: string; border: string; icon: string; iconBg: string }
> = {
  urgent: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    iconBg: "bg-red-100",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-600",
    iconBg: "bg-green-100",
  },
};

function AlertIcon({ type }: { type: AlertType }) {
  switch (type) {
    case "urgent":
      return <AlertCircle className="w-5 h-5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    case "info":
      return <Info className="w-5 h-5" />;
    case "success":
      return <CheckCircle2 className="w-5 h-5" />;
  }
}

function AlertItem({ alert }: { alert: Alert }) {
  const styles = alertStyles[alert.type];

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-3`}
    >
      <div className={`${styles.iconBg} ${styles.icon} p-2 rounded-full`}>
        <AlertIcon type={alert.type} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
        <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
        {alert.actionLabel && alert.actionLink && (
          <Link to={alert.actionLink}>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 -ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {alert.actionLabel}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AlertsSection() {
  const { alerts, loading } = useAlerts();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alerty i powiadomienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alerty i powiadomienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 py-4 text-green-700 bg-green-50 rounded-lg px-4">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="font-medium">Wszystko w porządku!</p>
              <p className="text-sm text-green-600">
                Brak alertów wymagających Twojej uwagi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alerty i powiadomienia
          <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
