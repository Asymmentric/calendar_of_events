import amqp, { Channel, Connection } from "amqplib";

import { variables } from "../../config/envLoader";
import Logger from "../logger";
import AnotherError from "../errors/anotherError";
import { IProduceMessageMQ } from "./types/interface";
import { ExchangesList, PriorityList } from "./types/enum";

class MessageQueue {
  private Exchanges = { NOTIFICATION: "notification" };
  private RoutingKeys = {
    NOTIFICATION_EMAIL: variables.ROUTING_KEY_NOTIFICATION_EMAIL,
  };

  private connection: Connection | null = null;
  private channelPool: Channel[] = [];
  private maxChannels: number = 10;
  private inUseChannels: Set<Channel> = new Set();

  public getConnectionMQ = async () => {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(variables.RABBITMQ);
      }
      return this.connection;
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    }
  };

  public createChannel = async () => {
    try {
      const connection = await this.getConnectionMQ();

      if (!connection) {
        return null;
      }
      const idleChannel = this.channelPool?.pop();

      if (idleChannel) {
        this.inUseChannels.add(idleChannel);
        return idleChannel;
      }

      if (this.inUseChannels.size < this.maxChannels) {
        const channel = await connection.createChannel();
        this.inUseChannels.add(channel);
        return channel;
      }

      if (this.inUseChannels.size >= this.maxChannels) {
        const channel = await connection.createChannel();
        this.inUseChannels.add(channel);
        return channel;
      }

      return null;
    } catch (error) {
      Logger.Log?.error(error);
      return null;
    }
  };

  public releaseChannel(channel: Channel): void {
    if (this.inUseChannels.has(channel)) {
      this.inUseChannels.delete(channel);
      this.channelPool.push(channel);
    }
    return;
  }

  public closeConnection = async () => {
    for (const channel of this.inUseChannels) {
      await channel.close();
    }
    for (const channel of this.channelPool) {
      await channel.close();
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    return;
  };

  public produce = async ({
    exchange,
    key,
    priority,
    data,
  }: {
    exchange: ExchangesList;
    key: string;
    priority: PriorityList;
    data: IProduceMessageMQ;
  }) => {
    let channel: Channel | null = null;
    try {
      if (!Object.values(this.Exchanges).includes(exchange)) {
        throw new AnotherError("RESOURCE_NOT_FOUND", "Exchange Not Found");
      }

      if (!Object.values(this.RoutingKeys).includes(key)) {
        throw new AnotherError("RESOURCE_NOT_FOUND", "Routing Key Not Found");
      }

      channel = await this.createChannel();

      if (!channel) {
        Logger.Log?.error("RabbitMQ channel not created");
        throw new AnotherError("SOMETHING_WENT_WRONG", "Something Went Wrong");
      }

      await channel.assertExchange(exchange, "topic", {
        durable: true,
        arguments: { "x-max-priority": 10 },
      });

      channel.publish(exchange, key, Buffer.from(JSON.stringify(data)), {
        persistent: true,
        priority,
      });

      return true;
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    } finally {
      if (channel) {
        this.releaseChannel(channel);
      }
    }
  };
}

export default MessageQueue;
