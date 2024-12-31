import express from "express";
import PostgresDB from "./config/database/postgres";
import CollegeEnquireRouter from "./enquiry/route";
import UserRouter, { AuthRouter } from "./users/route";
import Logger from "./utils/logger";
import { ErrorHandler } from "./utils/errors/errorHandler";
import NotFoundError from "./utils/errors/404notFound";

class Server {
  private app = express();
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  private config() {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb" }));
  }

  private router() {
    this.app.use("/ping", (req, res) => {
      res.status(200).json({ message: "pong" });
    });
    this.app.use("/api/v1/enquiry", CollegeEnquireRouter);
    this.app.use("/api/v1/auth", AuthRouter);
    this.app.use("/api/v1/user", UserRouter);

    this.app.all("*", async (request, response, next) => {
      console.info(request.url);
      next(new NotFoundError());
    });

    this.app.use(ErrorHandler as any);
  }

  public async start() {
    this.config();
    this.router();

    new PostgresDB();
    new Logger();

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

const server = new Server(9890);
server.start();
