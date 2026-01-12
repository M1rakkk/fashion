// src/api/auth.api.ts
import http from "./http";

export interface ILoginBody {
  username: string;
  password: string;
}

export interface IRegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IRegisterOwnerBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "owner";
}

export interface IRegisterOwnerResponse {
  id?: string;
  email: string;
  message?: string;
}

export const authApi = {
  // Login via Keycloak (OAuth2 password grant)
  login: (payload: ILoginBody) => {
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("client_id", "auth");
    formData.append("username", payload.username);
    formData.append("password", payload.password);
    
    return http.post("/auth/login", formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  },
  
  // Register new user
  register: (payload: IRegisterBody) => http.post("/register", payload),
  
  // Register as shop owner (via /api/register -> userservice/auth/registerowner)
  registerOwner: async (payload: IRegisterOwnerBody): Promise<IRegisterOwnerResponse> => {
    try {
      const response = await http.post<IRegisterOwnerResponse>("/api/register", {
        ...payload,
        role: "owner"
      });
      
      if (response.status === 201 || response.status === 200) {
        return response.data;
      }
      
      throw new Error("Unexpected response status");
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error("User with this email already exists");
      }
      throw error;
    }
  },
  
  // Get current user roles
  getUserRoles: (userId: string) => http.get(`/auth/user/${userId}/roles`),
};
