import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LangProvider, useLang } from '../store/langStore';

const TestComponent = () => {
    const { t, lang, toggleLang } = useLang();
    return (
        <div>
            <span data-testid="lang">{lang}</span>
            <span data-testid="projects">{t.projects}</span>
            <button onClick={toggleLang}>toggle</button>
        </div>
    );
};

describe('LangProvider', () => {
    it('should default to Russian', () => {
        render(<LangProvider><TestComponent /></LangProvider>);
        expect(screen.getByTestId('lang').textContent).toBe('ru');
        expect(screen.getByTestId('projects').textContent).toBe('Проекты');
    });

    it('should switch to English on toggle', () => {
        render(<LangProvider><TestComponent /></LangProvider>);
        fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
        expect(screen.getByTestId('lang').textContent).toBe('en');
        expect(screen.getByTestId('projects').textContent).toBe('Projects');
    });

    it('should switch back to Russian on second toggle', () => {
        render(<LangProvider><TestComponent /></LangProvider>);
        fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
        fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
        expect(screen.getByTestId('lang').textContent).toBe('ru');
    });
});
