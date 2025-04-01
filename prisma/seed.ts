// npm install @faker-js/faker
// npm install -D @types/faker


import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando la inserción de datos aleatorios...");

    // Crear Departamentos
    const departments = await prisma.department.createMany({
        data: Array.from({ length: 3 }, () => ({
            name: faker.commerce.department()
        }))
    });

    // Obtener los departamentos creados
    const departmentList = await prisma.department.findMany();

    // Crear Usuarios
    const users = await Promise.all(
        Array.from({ length: 10 }, async () => {
            return await prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    role: faker.helpers.arrayElement(["Admin", "User", "Manager"]),
                    departmentID: faker.helpers.arrayElement(departmentList.map(d => d.departmentID))
                }
            });
        })
    );

    // Crear Proyectos
    const projects = await Promise.all(
        Array.from({ length: 5 }, async () => {
            return await prisma.project.create({
                data: {
                    name: faker.commerce.productName(),
                    description: faker.lorem.sentence()
                }
            });
        })
    );

    // Relacionar Usuarios con Proyectos
    await Promise.all(
        users.map(user => {
            return prisma.userProject.createMany({
                data: projects.map(project => ({
                    userID: user.userID,
                    projectID: project.projectID,
                    projectRole: faker.helpers.arrayElement(["Developer", "Lead", "QA"])
                }))
            });
        })
    );

    // Crear Llamadas con fechas aleatorias
    const calls = await Promise.all(
        Array.from({ length: 10 }, async () => {
            const startTime = faker.date.past();
            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + faker.number.int({ min: 1, max: 3 }));

            return await prisma.call.create({
                data: {
                    title: faker.company.catchPhrase(),
                    startTime: startTime,
                    endTime: endTime,
                    summary: faker.lorem.sentence(),
                    projectID: faker.helpers.arrayElement(projects.map(p => p.projectID))
                }
            });
        })
    );

    // Crear Clientes
    const clients = await Promise.all(
        Array.from({ length: 5 }, async () => {
            return await prisma.client.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    organization: faker.company.name()
                }
            });
        })
    );

    // Agregar Participantes Internos
    await Promise.all(
        users.map(user => {
            return prisma.internalCallParticipants.createMany({
                data: calls.map(call => ({
                    userID: user.userID,
                    callID: call.callID
                }))
            });
        })
    );

    // Agregar Participantes Externos
    await Promise.all(
        clients.map(client => {
            return prisma.externalCallParticipants.createMany({
                data: calls.map(call => ({
                    clientEmail: client.email,
                    callID: call.callID
                }))
            });
        })
    );

    console.log("✅ Datos aleatorios insertados correctamente");
}

main()
    .catch(e => {
        console.error("❌ Error al insertar datos:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
