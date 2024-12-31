import amqp, { Channel, Connection } from "amqplib";
import { variables } from "../config/envLoader";
import AnotherError from "../utils/errors/anotherError";
import Logger from "../utils/logger";
import NotificationService from "../mailer";

class MessageQueueWorker {
  private Exchanges = { NOTIFICATION: "notification" };
  private BindingKeys = {
    NOTIFICATION: variables.ROUTING_KEY_NOTIFICATION_EMAIL,
  };

  private Queues = {
    NOTIFICATION: "notification",
  };

  private connection: Connection | null = null;
  private channel: Channel | null = null;

  public connect = async () => {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(variables.RABBITMQ);
      }

      if (!this.channel) {
        this.channel = await this.connection.createChannel();
      }

      return true;
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    }
  };

  public consumeNotificationExchange = async () => {
    try {
      const isConnected = await this.connect();
      if (!isConnected) {
        Logger.Log?.error("Failed to connect to RabbitMQ");
        return;
      }

      if (!this.channel || !this.connection) {
        Logger.Log?.error("Failed to connect to RabbitMQ");
        return;
      }

      await this.channel.assertExchange(this.Exchanges.NOTIFICATION, "topic", {
        durable: true,
        arguments: { "x-max-priority": 10 },
      });

      Logger.Log?.info(`Connected to RabbitMQ. Waiting for messages...`);

      const { queue } = await this.channel.assertQueue(
        this.Queues.NOTIFICATION
      );
      await this.channel.bindQueue(
        this.Queues.NOTIFICATION,
        this.Exchanges.NOTIFICATION,
        variables.BINDING_KEY_NOTIFICATION
      );

      await this.channel.consume(
        queue,
        async (message) => {
          if (message) {
            Logger.Log?.debug(JSON.parse(message.content.toString()));
            Logger.Log?.debug(message.fields);
            Logger.Log?.debug(message.properties);

            const messageObj = JSON.parse(message.content.toString());
            if (
              messageObj.type === "notification" &&
              messageObj.notificationDetails.type === "email"
            ) {
              const info = await new NotificationService().sendEmail(
                messageObj.notificationDetails.data
              );
              if (info) {
                Logger.Log?.info(
                  `Email sent to ${messageObj.notificationDetails.data.to}`
                );
                Logger.Log?.debug(info);
                this.channel?.ack(message);
              }
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    }
  };
}

(async () => {
  new Logger();
  const mqWorker = new MessageQueueWorker();
  Logger.Log?.info("Starting Worker...");
  await mqWorker.consumeNotificationExchange();
})();
