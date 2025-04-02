import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// HELPER FUNCTIONS
import { StartServer } from './utils/express/utils';

// ROUTES
import * as Routes from './routes/exportRoutes';

dotenv.config();

const app = express();
const router = express.Router();

// ROUTES HANDLING
router.get('/', Routes.Home);

router.get('/user/:userID/projects', Routes.getUserProjects);

router.get('/projects', Routes.getAllProjects);

router.post('/msft-auth', Routes.MicrosoftAuth);

router.get('/calls', Routes.getCalls);//?projectID=1234

router.get('/details', Routes.getCall); //?callID=1234

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', router);

// INITIALIZE SERVER
StartServer(app, 3000);
