export interface CreateProjectDTO{
    name: string, 
    description: string | null,
    problemDescription?: string | null,
    reqFuncionales?: string | null,
    reqNoFuncionales?: string | null,
    startDate?: Date | null,
    endDate?: Date | null,
    users: Array<{userID: number, projectRole: string}>,
    client?: {
        email: string,
        name: string,
        organization?: string,
        description?: string
    } | null
};

export interface UpdateProjectUsersDTO{
    projectID: number,
    users: Array<{userID: number, projectRole?: string}>
};