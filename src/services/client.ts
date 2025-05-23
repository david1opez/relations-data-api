import prisma from '../../client';
import type { Client } from '@prisma/client';
import HttpException from '../models/http-exception';

class ClientService {
    async getAllClients(): Promise<Client[]> {
        try {
            return await prisma.client.findMany({
                orderBy: {
                    name: 'asc',
                },
            })
        } catch (err) {
        throw new HttpException(500, 'Error fetching clients' + err);
        }
    }
    async createClient(clientData: {
        email: string;
        name: string;
        organization?: string;
        description?: string;
    }): Promise<Client> {
        try {
            return await prisma.client.create({
                data: clientData,
            })
        } catch (err: any) {
            if (err.code === 'P2002') {
                throw new HttpException(409, 'Client already exists');
            }
            throw new HttpException(500, 'Error creating client' + err);
        }
    }

    async deleteClient(email:string): Promise<void> {
        try {
            const client = await prisma.client.findUnique({
                where: { email },
            })
            if (!client) {
                throw new HttpException(404, 'Client not found');
            }
            await prisma.client.delete({
                where: { email },
            })
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err;
            }
            if (err.code === "P2025") {
                throw new HttpException(404, 'Client not found');
            }
            throw new HttpException(500, 'Error deleting client' + err);
        
        }
    }
}

export default ClientService
