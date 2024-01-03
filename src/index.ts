// src/index.js
import dotenv from "dotenv";
import express, { Express} from "express";
import { celebrate, Joi, errors, Segments } from "celebrate";

import { CUSTOM_HEADERS } from "./utils/constants";
import requestHandler from "./handler";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json())

app.use(
  "*",
  celebrate({
    [Segments.HEADERS]: Joi.object()
      .keys({
        [CUSTOM_HEADERS.T_PROXY_URL.toLowerCase()]: Joi.string()
          .uri()
          .required(),
        [CUSTOM_HEADERS.T_STORE.toLowerCase()]: Joi.string().required(),
      })
      .unknown(true),
  }),
  requestHandler
);

app.use(errors());

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

