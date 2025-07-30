export type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
};

export type UserSession = Omit<User, 'createdAt'>;

export type AuthResponse = {
  user?: UserSession;
  message?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = LoginCredentials & {
  name: string;
  role?: 'USER' | 'ADMIN';
};