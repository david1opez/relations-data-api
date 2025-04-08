import { Router } from "express";
import callRouter from "./call";
import projectRouter from "./project";
import Home from './Home';
import MicrosoftAuth from './MicrosoftAuth';

const api = Router();
api.use("/call", callRouter);
api.use("/project", projectRouter);
api.get("/", Home);
api.post("/msft-auth", MicrosoftAuth);

export default Router().use("/", api);



