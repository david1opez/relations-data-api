import { Project, User, UserProject } from "@prisma/client";
import prisma from "../../client";
import HttpException from "../models/http-exception";
import { CreateProjectDTO, UpdateProjectUsersDTO } from "../interfaces/projects";

class ProjectService {
    async getAllProjects() {
        try {
            const projects = await prisma.project.findMany({
              include: {
                reports: true,
                client: true,
              }
            });
            return projects;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching projects" + err);
        }
    }

    async getProjectById(projectID: number) {
      try {
          console.log(`Service: Fetching project with ID ${projectID}`);
          const project = await prisma.project.findUnique({
              where: { projectID: projectID },
              include: {
                  reports: true,
                  client: true,
                  
              }
          });
  
          
          if (!project) {
              throw new HttpException(404, `Project with ID ${projectID} not found`);
              
          }
          
          return project;
      } catch (err) {
          if (err instanceof HttpException) {
              throw err;
          }
          throw new HttpException(500, `Error fetching project: ${err}`);
      }
    }

    async getUserProjects(userID: number) {
        try {
            const userProjects = await prisma.userProject.findMany({
                where: { userID: userID },
                include: {
                    project: true,
                },
            });

            return userProjects;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching user projects" + err);
        }
    }

    async addProject(createProjectData: CreateProjectDTO) {
        try {
          const { name, description, users, problemDescription, reqFuncionales, reqNoFuncionales, startDate, endDate, client } = createProjectData;

          if (!name || name.trim() === '') {
            throw new HttpException(400, 'A name for the project is required');
          }
          
      
          const newProject = await prisma.$transaction(async (tx) => {
            // 1. Si hay usuarios, verificar si existen
            if (users && users.length > 0) {
              const usersID: number[] = users.map((user) => user.userID);
              const foundUsers = await tx.user.findMany({
                where: {
                  userID: {
                    in: usersID,
                  },
                },
                select: {
                  userID: true,
                },
              });
      
              if (usersID.length !== foundUsers.length) {
                throw new HttpException(400, "All users to be assigned must exist");
              }
            }
      
            // 2. Si hay cliente, verificar si existe o crearlo
            let clientEmail = null;
            if (client && client.email) {
              let foundClient = await tx.client.findUnique({ where: { email: client.email } });
              if (!foundClient) {
                foundClient = await tx.client.create({ data: client });
              }
              clientEmail = foundClient.email;
            }
      
            // 3. Crear el proyecto
            const project = await tx.project.create({
              data: {
                name,
                description,
                problemDescription,
                reqFuncionales,
                reqNoFuncionales,
                startDate,
                endDate,
                clientEmail: clientEmail,
              },
            });
      
            // 4. Si hay usuarios, crear relaciones en userProject
            if (users && users.length > 0) {
              const userProjectData = users.map((user) => ({
                userID: user.userID,
                projectID: project.projectID,
                projectRole: user.projectRole,
              }));
      
              await tx.userProject.createMany({
                data: userProjectData,
              });
            }
      
            return {
                project,
                assignedUsers: users || [],
              };
          });
      
          return newProject;
        } catch (err) {
          if (err instanceof HttpException) {
            throw err;
          }
          //console.error("Error in addProject service:", err);
          throw new HttpException(500, "Error adding project: " + err);
        }
    }
      

    async deleteProject(projectID: number){
        try{
            const project = await prisma.project.findUnique({
                where: {projectID: projectID},
                include: {
                    reports: true,
                    calls: true,
                    userProjects: true
                }
            });
            
            if(!project){
                throw new HttpException(404, `Project with ID ${projectID} not found`);
            }

            // Delete in transaction to ensure atomicity
            const deletedProject = await prisma.$transaction(async (tx) => {
                // Update reports to unlink them from the project
                if (project.reports.length > 0) {
                    await tx.report.updateMany({
                        where: { projectID: projectID },
                        data: { projectID: undefined }
                    });
                }

                // Delete all associated calls
                if (project.calls.length > 0) {
                    // First delete report calls
                    await tx.reportCall.deleteMany({
                        where: { 
                            call: { projectID: projectID }
                        }
                    });
                    
                    // Then delete call participants
                    await tx.internalCallParticipants.deleteMany({
                        where: { 
                            call: { projectID: projectID }
                        }
                    });
                    await tx.externalCallParticipants.deleteMany({
                        where: { 
                            call: { projectID: projectID }
                        }
                    });
                    
                    // Finally delete the calls
                    await tx.call.deleteMany({
                        where: { projectID: projectID }
                    });
                }

                // Delete user project associations
                if (project.userProjects.length > 0) {
                    await tx.userProject.deleteMany({
                        where: { projectID: projectID }
                    });
                }

                // Finally delete the project itself
                return await tx.project.delete({
                    where: {projectID: projectID}
                });
            });
            
            return deletedProject;
        } catch(err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error deleting project: " + err);
        }
    }

    async updateProjectUsers(newProjectUsersData: UpdateProjectUsersDTO) {
      try {
        const { projectID, users } = newProjectUsersData;

        const userIDSet = new Set();
        for (const user of users) {
          if (userIDSet.has(user.userID)) {
            throw new HttpException(400, 'Duplicate userID in request body');
          }
          userIDSet.add(user.userID);
        }

    
        const project = await prisma.project.findUnique({ where: { projectID } });
        if (!project) {
          throw new HttpException(404, `Project with ID ${projectID} not found`);
        }
    
        const updatedProjectUsers = await prisma.$transaction(async (tx) => {
          // 1. Verificar que los nuevos usuarios existan
          const userIDs = users.map((user) => user.userID);
          const foundUsers = await tx.user.findMany({
            where: { userID: { in: userIDs } },
            select: { userID: true },
          });
    
          if (foundUsers.length !== userIDs.length) {
            throw new HttpException(400, "All users to be assigned must exist");
          }
    
          // 2. Obtener usuarios actuales del proyecto
          const currentRelations = await tx.userProject.findMany({
            where: { projectID },
          });
    
          const currentUserIDs = currentRelations.map((rel) => rel.userID);
    
          // 3. Determinar acciones
          const usersToAdd = users.filter(
            (user) => !currentUserIDs.includes(user.userID)
          );
    
          const usersToRemove = currentRelations.filter(
            (rel) => !userIDs.includes(rel.userID)
          );
    
          const usersToUpdate = users.filter((user) => {
            const existing = currentRelations.find((rel) => rel.userID === user.userID);
            return existing && existing.projectRole !== user.projectRole;
          });
    
          // 4. Ejecutar operaciones
          if (usersToAdd.length > 0) {
            await tx.userProject.createMany({
              data: usersToAdd.map((user) => ({
                userID: user.userID,
                projectID,
                projectRole: user.projectRole,
              })),
            });
          }
    
          for (const user of usersToUpdate) {
            await tx.userProject.update({
              where: {
                userID_projectID: {
                  userID: user.userID,
                  projectID: projectID,
                },
              },
              data: {
                projectRole: user.projectRole,
              },
            });
          }
    
          if (usersToRemove.length > 0) {
            await tx.userProject.deleteMany({
              where: {
                projectID,
                userID: { in: usersToRemove.map((u) => u.userID) },
              },
            });
          }
    
          return await tx.userProject.findMany({ where: { projectID } });
        });
    
        return updatedProjectUsers;
      } catch (err) {
        if (err instanceof HttpException) throw err;
        //console.error("Error in updateProjectUsers service: ", err);
        throw new HttpException(500, "Error updating project users: " + err);
      }
    }

    async getProjectUsers(projectID: number) {
        try {
            const userProjects = await prisma.userProject.findMany({
                where: { projectID },
                include: {
                    user: {
                        select: {
                            userID: true,
                            name: true
                        }
                    }
                }
            });

            // Transform the response to only include userID and name
            const users = userProjects.map(up => ({
                userID: up.user.userID,
                name: up.user.name,
                projectRole: up.projectRole
            }));

            return users;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching project users: " + err);
        }
    }
}

export default ProjectService;