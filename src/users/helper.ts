import moment from "moment";
import Logger from "../utils/logger";
import UserDB from "./db";
import UsersService from "./service";
import { variables } from "../config/envLoader";
import { PriorityList } from "../utils/rabbitMQ/types/enum";
import NotificationService from "../notifications/service";
import { IEmailNotification } from "../notifications/types/interface";
import {
    NotificationStatus,
    NotificationType,
} from "../notifications/types/enum";

const { createNotification } = new NotificationService();

export default class UserHelper extends UserDB {
    private baseUrl = variables.BASE_URL;

    public magicLinkNotificationHelper = async (
        id: string,
        email: string,
        token: string,
        isRegistered: boolean,
        userId?: string
    ) => {
        try {
            const url = `${this.baseUrl}/api/v1/auth/magic-link/${id}?token=${token}`;

            Logger.Log?.info(url);

            const notificationObj: IEmailNotification = {
                from: variables.EMAIL_FROM_USER,
                to: [email],
                html: `<h2> To Login click: <a href="${url}">Login</a> </h2><br> Valid till ${moment()
                    .add(5, "minute")
                    .format("DD-MM-YYYY HH:mm")}`,
                subject: "Login",
            };

            if (isRegistered && userId) {
                await createNotification({
                    recipient_id: [userId],
                    type: NotificationType.EMAIL,
                    data: notificationObj,
                    status: NotificationStatus.PENDING,
                    priority: PriorityList.MAGIC_LINK,
                });
            } else {
                await createNotification({
                    recipient_email: email,
                    type: NotificationType.EMAIL,
                    data: notificationObj,
                    status: NotificationStatus.PENDING,
                    priority: PriorityList.MAGIC_LINK,
                });
            }

            Logger.Log?.info(`Notification sent to ${email} with magic-link`);
        } catch (error) {
            Logger.Log?.error(error);
        }
    };
}
