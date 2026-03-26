export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  department: string;
  createdAt: string;
  updatedAt: string;
}
