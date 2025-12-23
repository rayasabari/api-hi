import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import corsOptions from './config/cors.config';
import routes from './routes/index';

const app: Express = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

export default app;
