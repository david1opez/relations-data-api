import { Router } from "express";
import callRouter from "./call";
import projectRouter from "./project";
import userRouter from "./user";
import Home from './Home';
import deptRouter    from "./department";    
import MicrosoftAuth from './MicrosoftAuth';
import clientRouter from "./client";
import reportRouter from "./report";

const api = Router();

api.use("/call", callRouter);
api.use("/project", projectRouter);
api.use("/user", userRouter);
api.use("/department", deptRouter);        
api.get("/", Home);
api.post("/msft-auth", MicrosoftAuth);
api.use("/client", clientRouter);
api.use("/report", reportRouter);
export default Router().use("/", api);



