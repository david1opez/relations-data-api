export interface CreateProjectDTO{
    name: string, 
    description: string | null,
    users: Array<{userID: number, projectRole: string}>
};