import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';
import { AuthContext } from '../store/authContext';
import { LangProvider } from '../store/langStore';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => vi.fn() };
});

const mockUser = { id: '1', email: 'test@mail.ru', firstName: 'Иван', lastName: 'Иванов', role: 'Student' as const };

const renderWithUser = (user: typeof mockUser | null) => {
    const logout = vi.fn();
    render(
        <LangProvider>
            <AuthContext.Provider value={{ user, setUser: vi.fn(), accessToken: null, logout, setAccessToken: vi.fn() }}>
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            </AuthContext.Provider>
        </LangProvider>
    );
    return { logout };
};

describe('Header', () => {
    it('should render nothing when user is not logged in', () => {
        const { container } = render(
            <LangProvider>
                <AuthContext.Provider value={{ user: null, setUser: vi.fn(), accessToken: null, logout: vi.fn(), setAccessToken: vi.fn() }}>
                    <MemoryRouter><Header /></MemoryRouter>
                </AuthContext.Provider>
            </LangProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render navigation links when user is logged in', () => {
        renderWithUser(mockUser);
        expect(screen.getByText(/проекты/i)).toBeInTheDocument();
        expect(screen.getByText(/уведомления/i)).toBeInTheDocument();
    });

    it('should show user firstName in header', () => {
        renderWithUser(mockUser);
        expect(screen.getByText(/иван/i)).toBeInTheDocument();
    });

    it('should call logout when logout button clicked', () => {
        const { logout } = renderWithUser(mockUser);
        fireEvent.click(screen.getByRole('button', { name: /выйти/i }));
        expect(logout).toHaveBeenCalled();
    });

    it('should toggle language when EN/RU button clicked', () => {
        renderWithUser(mockUser);
        const langBtn = screen.getByRole('button', { name: /EN/i });
        fireEvent.click(langBtn);
        expect(screen.getByRole('button', { name: /RU/i })).toBeInTheDocument();
    });
});
