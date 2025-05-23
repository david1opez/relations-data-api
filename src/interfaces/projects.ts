export interface CreateProjectDTO{
    name: string, 
    description: string | null,
    problemDescription?: string | null,
    reqFuncionales?: string | null,
    reqNoFuncionales?: string | null,
    startDate?: Date | null,
    endDate?: Date | null,
    users: Array<{userID: number, projectRole: string}>
};

export interface UpdateProjectUsersDTO{
    projectID: number,
    users: Array<{userID: number, projectRole?: string}>
};