import dotenv from "dotenv";

dotenv.config();

const ENV = [
  "BASE_URL",
  /**
   * DB variables
   */

  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",

  "PORT",

  //MQ
  "RABBITMQ",

  //MQ Notification Keys
  "BINDING_KEY_NOTIFICATION",
  "ROUTING_KEY_NOTIFICATION_EMAIL",

  "JWT_SECRET",

  //EMAIL
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "EMAIL_FROM_USER",

  //S3
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_BUCKET_NAME",
] as const;

const loadVars = (env: readonly String[]): Record<string, string> => {
  const variables: Record<string, string> = {};

  env.forEach((name) => {
    const value = process.env[`${name}`];

    if (value) {
      variables[`${name}`] = value;
    } else {
      console.error(`Env ${name} not found`);
    }
  });

  return variables;
};

export const variables: Record<(typeof ENV)[number], string> = loadVars(ENV);
