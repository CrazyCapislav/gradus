import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../store/authStore';
import { LangProvider } from '../store/langStore';

vi.mock('../api/auth', () => ({
    login: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => vi.fn() };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <LangProvider>
        <AuthProvider>
            <MemoryRouter>{children}</MemoryRouter>
        </AuthProvider>
    </LangProvider>
);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('LoginPage', () => {
    it('should render login form', () => {
        render(<LoginPage />, { wrapper: Wrapper });
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    });

    it('should show error on failed login', async () => {
        const { login } = await import('../api/auth');
        vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'));

        render(<LoginPage />, { wrapper: Wrapper });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mail.ru' } });
        fireEvent.change(screen.getByLabelText(/пароль/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        await waitFor(() => {
            expect(screen.getByText(/неверный/i)).toBeInTheDocument();
        });
    });

    it('should call login with email and password on submit', async () => {
        const { login } = await import('../api/auth');
        vi.mocked(login).mockResolvedValue({ user: { id: '1', email: 'test@mail.ru', firstName: 'Test', lastName: 'User', role: 'Student' }, accessToken: 'token' });

        render(<LoginPage />, { wrapper: Wrapper });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mail.ru' } });
        fireEvent.change(screen.getByLabelText(/пароль/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith('test@mail.ru', 'password123');
        });
    });
});
