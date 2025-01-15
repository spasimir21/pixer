import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import './db';

const app = express();

app.use(cors());

app.listen(8080, () => console.log('Server is listening...'));
