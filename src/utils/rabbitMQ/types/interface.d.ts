import { NotificationType } from "../../../notifications/types/enum";
import {
  IEmailNotification,
  INotification,
} from "../../../notifications/types/interface";

export type IProduceMessageMQ =
  | {
      type: "notification";
      notificationData: (INotification & { email: string })[];
      notificationDetails: {
        type: NotificationType.EMAIL;
        data: IEmailNotification;
      };
    }
  | {
      type: "notification";
      notificationData: (INotification & { email: string })[];
      notificationDetails: {
        type: Exclude<NotificationType, NotificationType.EMAIL>;
        data: any;
      };
    };
