import "express-async-errors";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import router from "./infra/http/routes";
import { errorMiddleware } from "./middlewares/error";
import { cronJobs } from "./worker";
import { s3 } from "./services/aws";
const app = express();
dotenv.config();

const PORT = process.env.PORT || 3333;

app.use(
  cors({
    origin: "*",
  }),
);
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(express.static("public"));
app.use("/api/v1", router);

app.get("/", (req, res) => {
  const nodeVersion = process.version;

  const tempObj = {
    message: "Server is running",
    data: {
      status: "OK",
      node: nodeVersion,
    },
  };

  res.send(tempObj);
});

process.on("SIGTERM", () => {
  process.exit();
});

app.use(errorMiddleware);

const port = 443;

app.listen(port, () => {
  console.log(
    `Server listening on port ${port}. Access it at http://localhost:${port}`,
  );
});

cronJobs();
console.log("s3:", { s3: s3?.config?.apiVersion });
