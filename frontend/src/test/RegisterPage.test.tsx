import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import { AuthProvider } from '../store/authStore';
import { LangProvider } from '../store/langStore';

vi.mock('../api/auth', () => ({
    register: vi.fn()
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

describe('RegisterPage', () => {
    it('should render registration form', () => {
        render(<RegisterPage />, { wrapper: Wrapper });
        expect(screen.getByRole('button', { name: /регистрация/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/фамилия/i)).toBeInTheDocument();
    });

    it('should not have Admin option in role select', () => {
        render(<RegisterPage />, { wrapper: Wrapper });
        const select = screen.getByRole('combobox');
        expect(select).not.toHaveTextContent('Admin');
    });

    it('should show error on failed registration', async () => {
        const { register } = await import('../api/auth');
        vi.mocked(register).mockRejectedValue({
            response: { data: { message: 'Email exists' } }
        });

        render(<RegisterPage />, { wrapper: Wrapper });
        fireEvent.change(screen.getByLabelText(/имя/i), { target: { value: 'Иван' } });
        fireEvent.change(screen.getByLabelText(/фамилия/i), { target: { value: 'Иванов' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mail.ru' } });
        fireEvent.change(screen.getByLabelText(/пароль/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /регистрация/i }));

        await waitFor(() => {
            expect(screen.getByText(/email exists/i)).toBeInTheDocument();
        });
    });

    it('should call register with correct data on submit', async () => {
        const { register } = await import('../api/auth');
        vi.mocked(register).mockResolvedValue(undefined as any);

        render(<RegisterPage />, { wrapper: Wrapper });
        fireEvent.change(screen.getByLabelText(/имя/i), { target: { value: 'Иван' } });
        fireEvent.change(screen.getByLabelText(/фамилия/i), { target: { value: 'Иванов' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mail.ru' } });
        fireEvent.change(screen.getByLabelText(/пароль/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /регистрация/i }));

        await waitFor(() => {
            expect(register).toHaveBeenCalledWith('Иван', 'Иванов', 'test@mail.ru', 'password123', 'Student');
        });
    });
});
