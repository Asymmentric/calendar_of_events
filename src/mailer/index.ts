import nodemailer from "nodemailer";
import _ from "lodash";
import Logger from "../utils/logger";
import { variables } from "../config/envLoader";
import { IEmailNotification } from "../notifications/types/interface";

class MailerService {
  private transporter = nodemailer.createTransport({
    host: variables.EMAIL_HOST,
    port: Number(variables.EMAIL_PORT),
    secure: false,
    auth: {
      user: variables.EMAIL_USER,
      pass: variables.EMAIL_PASSWORD,
    },
  });

  public sendEmail = async (data: IEmailNotification) => {
    try {
      return this.transporter.sendMail(data);
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    }
  };
}

export default MailerService;
