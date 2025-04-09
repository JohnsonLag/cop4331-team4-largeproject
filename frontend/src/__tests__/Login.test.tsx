import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/User/Login';
import axios from 'axios';
import { buildPath } from '../components/Path';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn().mockReturnValue({
        userId: '123',
        firstName: 'John',
        lastName: 'Doe'
    })
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key],
        setItem: (key: string, value: string) => { store[key] = value; },
        clear: () => { store = {}; },
        removeItem: (key: string) => { delete store[key]; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location.href
const originalLocation = window.location;
delete window.location;
window.location = { ...originalLocation, href: '' } as Location;

// Mock storeToken
jest.mock('../tokenStorage', () => ({
    storeToken: jest.fn(),
    Token: {}
}));

describe('Login Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        window.location.href = '';
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        window.location = originalLocation;
        jest.restoreAllMocks();
    });

    const renderLoginComponent = () => {
        return render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    describe('Login Form Rendering', () => {
        it('should render login form with all required elements', () => {
            renderLoginComponent();
            
            expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
            expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
            expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
            expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should display error message for empty fields', async () => {
            renderLoginComponent();
            
            const form = document.querySelector('form');
            
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.removeAttribute('required');
            });
            
            const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });
            
            fireEvent.change(usernameInput, { target: { value: '' } });
            fireEvent.change(passwordInput, { target: { value: '' } });
            
            fireEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.getByText('All fields must be filled out.')).toBeInTheDocument();
            });
        });
    });

    describe('Login Authentication', () => {
        it('should call login API with correct credentials', async () => {
            mockedAxios.mockResolvedValueOnce({ 
                data: { token: { accessToken: 'test-token' }, error: '' } 
            });
            
            renderLoginComponent();
            
            const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });
            
            await userEvent.type(usernameInput, 'testuser');
            await userEvent.type(passwordInput, 'Password123');
            await userEvent.click(loginButton);
            
            expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
                method: 'post',
                url: buildPath('api/login'),
                data: JSON.stringify({ login: 'testuser', password: 'Password123' })
            }));
        });

        it('should redirect to notes page on successful login', async () => {
            const mockToken = { accessToken: 'test-token', refreshToken: 'refresh-token' };
            
            mockedAxios.mockResolvedValueOnce({ 
                data: { token: mockToken, error: '' } 
            });
            
            renderLoginComponent();
            
            const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });
            
            await userEvent.type(usernameInput, 'testuser');
            await userEvent.type(passwordInput, 'Password123');
            await userEvent.click(loginButton);
            
            await waitFor(() => {
                expect(window.location.href).toBe('/notes');
            });
        });

        it('should display error message on failed login', async () => {
            mockedAxios.mockResolvedValueOnce({ 
                data: { token: null, error: 'User/Password combination incorrect' } 
            });
            
            renderLoginComponent();
            
            const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            const loginButton = screen.getByRole('button', { name: /login/i });
            
            await userEvent.type(usernameInput, 'wronguser');
            await userEvent.type(passwordInput, 'wrongpass');
            await userEvent.click(loginButton);
            
            await waitFor(() => {
                expect(screen.getByText(/User\/Password combination incorrect/i)).toBeInTheDocument();
            });
        });
    });

    describe('Navigation', () => {
        it('should link to signup page', () => {
            renderLoginComponent();
            
            const signupLink = screen.getByText(/Sign up/i);
            expect(signupLink.getAttribute('href')).toBe('/signup');
        });
        
        it('should link to forgot-password page', () => {
            renderLoginComponent();
            
            const resetPasswordLink = screen.getByText(/Reset Password/i);
            expect(resetPasswordLink.getAttribute('href')).toBe('/forgot-password');
        });
    });
});