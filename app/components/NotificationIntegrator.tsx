import { ReactNode } from 'react';
import { useNotificationIntegration } from '../hooks/useNotificationIntegration';

export default function NotificationIntegrator({ children }: { children: ReactNode }) {
  useNotificationIntegration();
  return <>{children}</>;
}
