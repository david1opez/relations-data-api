import { Project, User, UserProject } from "@prisma/client";
import prisma from "../../client";
import HttpException from "../models/http-exception";
import { CreateProjectDTO, UpdateProjectUsersDTO } from "../interfaces/projects";

class ProjectService {
    async getAllProjects() {
        try {
            const projects = await prisma.project.findMany();
            return projects;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching projects" + err);
        }
    }

    async getUserProjects(userID: number) {
        try {
            const userProjects = await prisma.userProject.findMany({
                where: { userID: userID },
                include: {
                    project: true, // Include project details
                },
            });

            const projects = userProjects.map(up => up.project);

            return projects;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching user projects" + err);
        }
    }

    async addProject(createProjectData: CreateProjectDTO) {
        try {
        
          const {name, description, users} = createProjectData;

          // Using an interactive transaction  
          const newProject = await prisma.$transaction(async (tx) => {

            // 1. Veryfing if users exist
            const usersID: Array<number> = users.map(user => user.userID);
            const foundUsers: Array<{userID: number}> = await tx.user.findMany({
                where: {
                    userID: {
                        in: usersID,
                    },
                },
                select: {
                    userID: true,
                }
            });
            if(usersID.length !== foundUsers.length){
                throw new HttpException(400, "All users to be assigned must exist")
            }

            // 2. Creation of the project
            const project = await tx.project.create({
                data: {
                    name,
                    description,
                },
            });

            // 3. Data preparation for UserProject records
            if (users && users.length > 0){
                const userProjectData: Array<UserProject> = users.map(user => {
                    return {
                        userID: user.userID,
                        projectID: project.projectID,
                        projectRole: user.projectRole
                    };
                });

                // 4. Cration of UserProject records
                await tx.userProject.createMany({
                    data: userProjectData,
                });
            } else{
                throw new HttpException(400, "Bad request");
            }
            return project;
          });

          return newProject;
        } catch (err) {
          if (err instanceof HttpException) {
            throw err;
          }
          console.error("Error in addProject service:", err);
          throw new HttpException(500, "Error adding project: " + err);
        }
    }

    async deleteProject(projectID: number){
        try{
            const project = await prisma.project.findUnique({where: {projectID: projectID}});
            
            if(!project){
                throw new HttpException(404, `Project with ID ${projectID} not found`);
            }

            const deletedProject = await prisma.project.delete({where: {projectID: projectID}});
            
            return deletedProject;
        } catch(err) {
            if (err instanceof HttpException) {
                throw err;
            }
            console.error("Error in deleteProject service: ", err);
            throw new HttpException(500, "Error deleting project: " + err);
        }
    }

    async updateProjectUsers(newProjectUsersData: UpdateProjectUsersDTO) {
        try {
          const { projectID, users } = newProjectUsersData
    
          // Verify the project exists
          const project = await prisma.project.findUnique({ where: { projectID: projectID } })
    
          if (!project) {
            throw new HttpException(404, `Project with ID ${projectID} not found`)
          }
    
          // Using an interactive transaction
          const updatedProjectUsers = await prisma.$transaction(async (tx) => {
            // 1. Verify if users exist
            if (users && users.length > 0) {
              const usersID: Array<number> = users.map((user) => user.userID)
              const foundUsers: Array<{ userID: number }> = await tx.user.findMany({
                where: {
                  userID: {
                    in: usersID,
                  },
                },
                select: {
                  userID: true,
                },
              })
    
              if (usersID.length !== foundUsers.length) {
                throw new HttpException(400, "All users to be assigned must exist")
              }
            }
    
            // 2. Delete existing UserProject assignments for this project
            await tx.userProject.deleteMany({
              where: {
                projectID: projectID,
              },
            })
    
            // 3. If no users are provided, just remove all assignments
            if (!users || users.length === 0) {
              return []
            }
    
            // 4. Prepare data for UserProject records
            const userProjectData = users.map((user) => {
              return {
                userID: user.userID,
                projectID: projectID,
                projectRole: user.projectRole || null,
              }
            })
    
            // 5. Create new UserProject records
            await tx.userProject.createMany({
              data: userProjectData,
            })
    
            // 6. Return the new UserProject records
            const newProjectUserRecords = await tx.userProject.findMany({
              where: {
                projectID: projectID,
              },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            })
    
            return newProjectUserRecords
          })
    
          return updatedProjectUsers
        } catch (err) {
          if (err instanceof HttpException) {
            throw err
          }
          console.error("Error in updateProjectUsers service: ", err)
          throw new HttpException(500, "Error updating project users: " + err)
        }
      }
    }
    

export default ProjectService;