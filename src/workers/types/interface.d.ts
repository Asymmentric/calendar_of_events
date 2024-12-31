export interface IMessageBody {
  from: string;
  to: string[];
  subject: string;
  body: string;
  attachments?: { filename: string; path: string }[];
}
