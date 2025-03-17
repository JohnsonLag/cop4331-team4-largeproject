import { jwtDecode } from 'jwt-decode';

export interface Token {
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
        return ud;

    } catch (e: any) {
        console.log(e.message);
        return null;
    }
}

export function deleteToken(): void | string {
    try {
        localStorage.removeItem('token_data');
    } catch (e: any) {
        console.log("ERROR: Could not remove token data upon user logout: ", e);
    }
}

interface TokenPayload {
    userId: number; 
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

export function getFirstNameFromToken(token: string): string {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.firstName;
    }
    catch (error) {
        console.error('Failed to decode token: ', error);
        return ''; // Return empty name if decoding fails
    }
}

export function getLastNameFromToken(token: string): string {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.lastName;
    }
    catch (error) {
        console.error('Failed to decode token: ', error);
        return ''; // Return empty name if decoding fails
    }
}

