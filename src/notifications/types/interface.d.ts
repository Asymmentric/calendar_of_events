import { PriorityList } from "../../utils/rabbitMQ/types/enum";
import { NotificationStatus, NotificationType } from "./enum";

export type INotification = {
  id: string;
  recipient_id: string | null;
  type_id: string;
  status: string;
  data: IEmailNotification | Record<string, any>;
  notification_sender_platform?: string | null;
  sender_notification_id?: string | null;
  created_at: string;
  updated_at: string;
};

export interface INotificationStatus {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type INotificationCreate =
  | INotificationCreateWithIDS
  | INotificationWithRecipientEmail
  | INotificationWithRecipientIdsGeneric;

export type INotificationCreateWithIDS = {
  recipient_id: string[];
  type: NotificationType.EMAIL;
  data: IEmailNotification;
  status?: NotificationStatus;
  priority?: PriorityList;
};

export type INotificationWithRecipientIdsGeneric = {
  recipient_id: string[];
  type: Exclude<NotificationType, NotificationType.EMAIL>;
  data: Record<string, any>;
  status?: NotificationStatus;
  priority?: PriorityList;
};
export type INotificationWithRecipientEmail = {
  recipient_email: string;
  type: NotificationType.EMAIL;
  data: IEmailNotification;
  status?: NotificationStatus;
  priority?: PriorityList;
};

export interface IEmailNotification {
  to: string[];
  html: string;
  from: string;
  subject: string;
  attachments?: { filename: string; path: string }[];
}
