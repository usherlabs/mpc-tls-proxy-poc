// src/index.js
import { celebrate, errors, Joi, Segments } from 'celebrate';
import dotenv from 'dotenv';
import express, { Express } from 'express';

import { generateProof, verifyProof } from './handler';
import { T_HEADERS } from './utils/constants';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/verify', verifyProof);

app.use(
	'/proxy',
	celebrate({
		[Segments.HEADERS]: Joi.object()
			.keys({
				[T_HEADERS.T_PROXY_URL.toLowerCase()]: Joi.string().uri().required(),
				[T_HEADERS.T_STORE.toLowerCase()]: Joi.string().required(),
			})
			.unknown(true),
	}),
	generateProof,
);

app.use(errors());

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
