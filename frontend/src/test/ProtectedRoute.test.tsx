import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../store/authContext';
import { LangProvider } from '../store/langStore';

const mockUser = { id: '1', email: 'test@mail.ru', firstName: 'Test', lastName: 'User', role: 'Student' as const };

const renderProtected = (user: typeof mockUser | null) =>
    render(
        <LangProvider>
            <AuthContext.Provider value={{ user, setUser: vi.fn(), accessToken: null, logout: vi.fn(), setAccessToken: vi.fn() }}>
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route path="/protected" element={
                            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        </LangProvider>
    );

describe('ProtectedRoute', () => {
    it('should render children when user is logged in', () => {
        renderProtected(mockUser);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when user is not logged in', () => {
        renderProtected(null);
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
