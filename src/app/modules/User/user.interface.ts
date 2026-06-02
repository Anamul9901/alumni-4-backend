
export interface TUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'project_manager' | 'team_member';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TLoginUser {
  email: string;
  password: string;
}

export interface TChangePassword {
  email: string;
  oldPassword: string;
  newPassword: string;
}