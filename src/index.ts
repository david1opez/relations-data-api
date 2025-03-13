import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// HELPER FUNCTIONS
import { StartServer } from './utils/express/utils';

// ROUTES
import * as Routes from './routes/exportRoutes';
 
const app = express();
const router = express.Router();

// ROUTES HANDLING
router.get('/', Routes.Home);

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', router);

// INITIALIZE SERVER
StartServer(app, 3000);
