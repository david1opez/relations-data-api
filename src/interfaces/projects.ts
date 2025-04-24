export interface CreateProjectDTO{
    name: string, 
    description: string | null,
    users: Array<{userID: number, projectRole: string}>
};

export interface UpdateProjectUsersDTO{
    projectID: number,
    users: Array<{userID: number, projectRole: string}>
};