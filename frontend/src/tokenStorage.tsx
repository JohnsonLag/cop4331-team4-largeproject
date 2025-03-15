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