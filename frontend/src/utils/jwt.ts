import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number;
  iat: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
