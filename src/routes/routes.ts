import { Router } from "express";
import callRouter from "./call";
import projectRouter from "./project";
import userRouter from "./user";
import Home from './Home';
import deptRouter    from "./department";    
import MicrosoftAuth from './MicrosoftAuth';
import auditLogRouter from "./auditlog";
import clientRouter from "./client";

const api = Router();

api.use("/call", callRouter);
api.use("/project", projectRouter);
api.use("/user", userRouter);
api.use("/department", deptRouter);        
api.get("/", Home);
api.post("/msft-auth", MicrosoftAuth);
api.use("/auditlog", auditLogRouter);
api.use("/client", clientRouter);

export default Router().use("/", api);



