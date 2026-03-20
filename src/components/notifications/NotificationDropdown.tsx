import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCheck, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, any> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
};

export const NotificationDropdown = () => {
  const { notifications, isLoading, markAsRead, markAllRead, unreadCount } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <CheckCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">You're all caught up 🎉</p>
        <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs">
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Info;
            return (
              <div
                key={notif.id}
                className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notif.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 ${notif.type === 'success' ? 'text-green-500' : 'text-primary'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
