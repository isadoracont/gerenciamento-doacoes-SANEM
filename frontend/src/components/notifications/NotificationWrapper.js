"use client";
import { NotificationProvider } from './NotificationProvider';

export default function NotificationWrapper({ children }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

