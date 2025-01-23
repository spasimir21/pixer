import 'dotenv/config';

import { bootstrapRouter } from './api/bootstrapRouter';
import { API_STRUCTURE } from '@api/structure';
import { APIHandlers } from './handlers';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '2mb' }));

app.use(bootstrapRouter(API_STRUCTURE, APIHandlers));

const PORT = parseInt(process.env.PORT ?? '8080');

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
