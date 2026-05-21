export interface User {
  _id: string;
  avatar?: { url: string; localPath?: string };
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}
