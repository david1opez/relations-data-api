export interface CreateAuditLogDTO {
    action: string
    description?: string
    userID: number
  }
  
  export interface GetAuditLogsByProjectDTO {
    projectID: number
  }
  