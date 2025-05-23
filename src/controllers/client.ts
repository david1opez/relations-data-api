import ClientService from "../services/client"
import type { Client } from "@prisma/client"

class ClientController {
    private clientService: ClientService

    constructor() {
        this.clientService = new ClientService()
    }

    async getAllClients(): Promise<Client[]> {
        return this.clientService.getAllClients()
}

    async createClient(clientData: {
        email: string
        name: string
        organization?: string
        description?: string
    }): Promise<Client> {
        return this.clientService.createClient(clientData)
    }

    async deleteClient(email: string): Promise<void> {
        return this.clientService.deleteClient(email)
    }
}

export default ClientController


