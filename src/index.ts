import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// HELPER FUNCTIONS
import { StartServer } from './utils/express/utils';

// ROUTES
import * as Routes from './routes/exportRoutes';
import getUserProjects from './routes/getUserProjects';
import getAllProjects from './routes/getAllProjects';

dotenv.config();

const app = express();
const router = express.Router();

// ROUTES HANDLING
router.get('/', Routes.Home);

router.get('/user/:userID/projects', getUserProjects);

router.get('/projects', getAllProjects);

router.post('/msft-auth', Routes.MicrosoftAuth);

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', router);

// INITIALIZE SERVER
StartServer(app, 3000);
