import { v4 } from "uuid";
import moment from "moment";

import AnotherError from "../utils/errors/anotherError";
import Logger from "../utils/logger";
import NotificationDb from "./db";
import { NotificationStatus, NotificationType } from "./types/enum";
import { ExchangesList, PriorityList } from "../utils/rabbitMQ/types/enum";
import { variables } from "../config/envLoader";
import MessageQueue from "../utils/rabbitMQ";
import {
  IEmailNotification,
  INotification,
  INotificationCreate,
} from "./types/interface";
import { IProduceMessageMQ } from "../utils/rabbitMQ/types/interface";

const { produce } = new MessageQueue();

class NotificationService extends NotificationDb {
  public createNotification = async (notificationData: INotificationCreate) => {
    const {
      type = NotificationType.EMAIL,
      data,
      priority = PriorityList.PROMOTION,
      status = NotificationStatus.PENDING,
    } = notificationData;

    let isRegistered = true;

    const notificationStatus = await this.fetchNotificationStatusQuery(status);
    if (!notificationStatus) {
      Logger.Log?.error(`Notification status not found: ${status}`);
      throw new AnotherError("SOMETHING_WENT_WRONG", "Something went wrong");
    }

    const notificationType = await this.fetchNotificationTypesQuery(type);
    if (!notificationType) {
      Logger.Log?.error(`Notification type not found: ${type}`);
      throw new AnotherError("SOMETHING_WENT_WRONG", "Something went wrong");
    }

    let recipient_ids: string[] = [];
    if ("recipient_id" in notificationData) {
      recipient_ids = notificationData.recipient_id;
    }

    if ("recipient_email" in notificationData) {
      recipient_ids = [notificationData.recipient_email];
      isRegistered = false;
    }

    if (!recipient_ids.length) {
      Logger.Log?.error(`Notification recipient not found: ${recipient_ids}`);
      return;
    }

    const notificationObj: (INotification & { email: string })[] = (
      await Promise.all(
        recipient_ids.map(async (id) => {
          const userData = isRegistered
            ? await this.getUserByIdQuery(id)
            : { email: id };

          if (isRegistered && !userData) {
            Logger.Log?.error(`User not found: ${id}`);
            return null;
          }

          const notification: INotification & { email: string } = {
            id: v4(),
            recipient_id: isRegistered ? id : null,
            type_id: notificationType.id,
            status: notificationStatus.id,
            data,
            created_at: moment().format(),
            updated_at: moment().format(),
            email: isRegistered ? userData.email : id,
          };

          return notification;
        })
      )
    ).filter((i) => i !== null);

    await this.createNotificationQuery(
      notificationObj.map(({ email, ...rest }) => rest)
    );

    if (type === NotificationType.EMAIL) {
      //produce email message
      const status = await this.produceEmailMessage({
        priority,
        notificationData: notificationObj as (INotification & {
          email: string;
        })[],
      });

      if (!status) {
        Logger.Log?.error("Failed to produce email message");
        throw new AnotherError("SOMETHING_WENT_WRONG", "Something went wrong");
      }
    }
  };

  private produceEmailMessage = async ({
    priority,
    notificationData,
  }: {
    priority: PriorityList;
    notificationData: (INotification & { email: string })[];
  }) => {
    try {
      const {
        html,
        attachments = [],
        from = variables.EMAIL_FROM_USER,
        subject,
      } = notificationData[0].data;

      let mailData: IEmailNotification = {
        from,
        to: notificationData.map(({ email }) => email),
        subject,
        html: html || `<h1> Testing Sending Tickets</h1>`,
        attachments: attachments,
      };

      const messageData: IProduceMessageMQ = {
        type: "notification",
        notificationData,
        notificationDetails: {
          type: NotificationType.EMAIL,
          data: mailData,
        },
      };

      const messageObj = {
        exchange: ExchangesList.NOTIFICATION,
        key: variables.ROUTING_KEY_NOTIFICATION_EMAIL,
        priority,
        data: messageData,
      };

      return produce(messageObj);
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    }
  };
}

export default NotificationService;
