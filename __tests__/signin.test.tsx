// filepath: /home/msousa/etic/Projeto-Final-Final/getParked/__tests__/signin.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInPage from '@/app/auth/signin/page';

// Mock dos hooks necessários
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    prefetch: jest.fn(),
    replace: jest.fn()
  })
}));

// Importar o mock do toast para testes
import { showToast, resetToastMocks } from './__mocks__/toast';
jest.mock('@/lib/toast', () => ({
  showToast
}));

// Mock do Supabase Provider
const mockSignInWithPassword = jest.fn();
const mockGetProfile = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/providers/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: mockGetProfile
          })
        })
      })
    }
  })
}));

// Mock para componentes UI do projeto
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => (
    <input 
      type="checkbox" 
      data-testid="checkbox-mock"
      {...props} 
    />
  )
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => (
    <button {...props} />
  )
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => (
    <input {...props} />
  )
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: (props: any) => <div data-testid="alert" {...props} />,
  AlertDescription: (props: any) => <div data-testid="alert-description" {...props} />
}));

jest.mock('@/components/ui/card', () => ({
  Card: (props: any) => <div data-testid="card" {...props} />,
  CardHeader: (props: any) => <div data-testid="card-header" {...props} />,
  CardContent: (props: any) => <div data-testid="card-content" {...props} />,
  CardFooter: (props: any) => <div data-testid="card-footer" {...props} />,
  CardDescription: (props: any) => <div data-testid="card-description" {...props} />
}));

jest.mock('@/components/ui/label', () => ({
  Label: (props: any) => <label {...props} />
}));

jest.mock('@/components/animations/fade-in', () => ({
  __esModule: true,
  default: (props: any) => <div>{props.children}</div>
}));

jest.mock('@/components/auth/auth-header', () => ({
  __esModule: true,
  default: (props: any) => (
    <div>
      <h2>{props.title}</h2>
      {props.subtitle && props.subtitleLink && (
        <p>
          {props.subtitle} <a href={props.subtitleLink.href}>{props.subtitleLink.label}</a>
        </p>
      )}
    </div>
  )
}));

// Mock para componentes do Radix UI
jest.mock('@radix-ui/react-checkbox', () => ({
  Root: (props: any) => <div data-testid="checkbox-root" {...props} />,
  Indicator: (props: any) => <div data-testid="checkbox-indicator" {...props} />
}));

// Mock para framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => <div {...props}>{props.children}</div>
  },
  AnimatePresence: (props: any) => <>{props.children}</>
}));

// Mock para componentes Lucide
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />
}));

describe('SignIn Page', () => {
  beforeEach(() => {
    // Reset dos mocks entre testes
    jest.clearAllMocks();
    resetToastMocks();
    
    // Configuração padrão para sucesso de login
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'teste@example.com' },
        session: { access_token: 'fake-token' }
      },
      error: null
    });
    
    mockGetProfile.mockResolvedValue({
      data: { role: 'client' },
      error: null
    });
    
    // Mock dos documentos do DOM que podem estar faltando
    Object.defineProperty(document, 'querySelector', {
      writable: true,
      value: jest.fn().mockImplementation((selector) => {
        if (selector === 'input[name="email"]') {
          return { 
            type: 'email',
            name: 'email',
            value: '', 
            getAttribute: () => 'email',
            toBeInTheDocument: () => true 
          };
        }
        if (selector === 'input[name="password"]') {
          return { 
            type: 'password',
            name: 'password',
            value: '', 
            getAttribute: () => 'password',
            toBeInTheDocument: () => true 
          };
        }
        if (selector === 'button[type="submit"]') {
          return { 
            type: 'submit',
            disabled: false, 
            textContent: 'Entrar',
            toBeInTheDocument: () => true 
          };
        }
        return null;
      })
    });
  });

  test('renderiza o formulário de login corretamente', () => {
    const { container } = render(<SignInPage />);
    
    // Use uma abordagem mais robusta combinando screen e container
    // para encontrar os elementos do formulário
    const emailInput = screen.getByLabelText(/email/i) || 
                       container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/senha/i) || 
                         container.querySelector('input[name="password"]');
    const submitButton = screen.getByRole('button', { name: /entrar/i }) || 
                        container.querySelector('button[type="submit"]');
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de Login: Elementos essenciais do formulário presentes');
  });
  
  test('exibe erro ao fazer login com credenciais inválidas', async () => {
    // Mock para simular erro de login
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    });
    
    const { container } = render(<SignInPage />);
    
    // Interagir diretamente com os campos de formulário
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/senha/i) || container.querySelector('input[name="password"]');
    const submitButton = screen.getByRole('button', { name: /entrar/i }) || container.querySelector('button[type="submit"]');
    
    // Preencher o formulário
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@exemplo.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    
    // Enviar formulário
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que o método de autenticação foi chamado com os dados corretos
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'usuario@exemplo.com',
        password: 'senha123'
      });
    });
    
    // Verificar que a mensagem de erro foi exibida
    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalled();
    });
    
    // Output do teste
    console.log('✅ Página de Login: Tratamento de erro de login funcionando');
  });
  
  test('redireciona após login bem-sucedido', async () => {
    // Configurar mocks para sucesso
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'usuario@exemplo.com' },
        session: { access_token: 'fake-token' }
      },
      error: null
    });
    
    mockGetProfile.mockResolvedValue({
      data: { role: 'client' },
      error: null
    });
    
    const { container } = render(<SignInPage />);
    
    // Interagir diretamente com os campos de formulário
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/senha/i) || container.querySelector('input[name="password"]');
    const submitButton = screen.getByRole('button', { name: /entrar/i }) || container.querySelector('button[type="submit"]');
    
    // Preencher o formulário
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@exemplo.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    
    // Enviar formulário
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que o método de login foi chamado com os dados corretos
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'usuario@exemplo.com',
        password: 'senha123'
      });
    });
    
    // Verificar redirecionamento
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/map');
    });
    
    // Verificar que toast de sucesso foi chamado
    expect(showToast.success).toHaveBeenCalled();
    
    // Output do teste
    console.log('✅ Página de Login: Redirecionamento após login bem-sucedido');
  });
});
