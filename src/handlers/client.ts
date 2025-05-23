import type { Request, Response, NextFunction } from "express"
import ClientController from "../controllers/client"
import HttpException from "../models/http-exception"

export default class ClientHandler {
    public clientController: ClientController

    constructor() {
        this.clientController = new ClientController()
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
        const clients = await this.clientController.getAllClients()
        res.status(200).json(clients)
    } catch (err) {
        next(err)
        }
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
        const { email, name, organization, description } = req.body

        if (!email || !name) {
            throw new HttpException(400, "Email and name are required")
        }

        const client = await this.clientController.createClient({
            email,
            name,
            organization,
            description,
        })

        res.status(201).json(client)
        } catch (err) {
        next(err)
        }
    }
    public async remove(req: Request, res: Response, next: NextFunction) {
        try {
        const { email } = req.params

        if (!email) {
            throw new HttpException(400, "Email is required")
        }

        await this.clientController.deleteClient(email)
        res.sendStatus(204)
        } catch (err) {
        next(err)
        }
    }
}
