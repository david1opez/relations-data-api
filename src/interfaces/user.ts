export interface UpdateUserDTO {
    name?: string
    email?: string
    password?: string
    role?: string
    departmentID?: number
  }

export interface ProjectAssignment {
  projectID: number
  projectRole?: string
}

export interface UpdateUserProjectsDTO {
  userID: number
  projects: ProjectAssignment[]
}
