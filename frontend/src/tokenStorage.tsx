import { jwtDecode } from 'jwt-decode';

interface Token {
    accessToken: string;
}

export function storeToken(tok: Token): void {
    try {
        localStorage.setItem('token_data', tok.accessToken);
    } catch (e: any) {
        console.log(e.message);
    }
}

export function retrieveToken(): string | null {
    let ud: string | null = null;
    try {
        ud = localStorage.getItem('token_data');

    } catch (e: any) {
        console.log(e.message);
    }
    return ud;
}

interface TokenPayload {
    userId: number; // Assuming userId is a string
    firstName: string;
    lastName: string;
    iat?: number; // Optional: Issued at (timestamp)
    exp?: number; // Optional: Expiration time (timestamp)
}

export function getUserIdFromToken(token: string): number {
    try {
        const decoded = jwtDecode<TokenPayload>(token); // Decode the token with type safety
        return decoded.userId; // Return the userId from the payload

    } catch (error) {
        console.error('Failed to decode token:', error);
        return -1; // Return bad user id if decoding fails
    }
  };