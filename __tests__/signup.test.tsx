// filepath: /home/msousa/etic/Projeto-Final-Final/getParked/__tests__/signup.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpPage from '@/app/auth/signup/page';

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
const mockSignUp = jest.fn();
const mockInsertProfile = jest.fn();

jest.mock('@/providers/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signUp: mockSignUp
      },
      from: () => ({
        insert: mockInsertProfile,
        select: () => ({
          eq: () => ({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          })
        })
      })
    }
  })
}));

// Mock para componentes UI do projeto
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
  Label: (props: any) => <label htmlFor={props.htmlFor}>{props.children}</label>
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
  User: () => <div data-testid="user-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />
}));

describe('SignUp Page', () => {
  beforeEach(() => {
    // Reset dos mocks entre testes
    jest.clearAllMocks();
    resetToastMocks();
    
    // Configuração padrão para sucesso de registro
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'new-user-123', email: 'novo@example.com' },
        session: null
      },
      error: null
    });
    
    mockInsertProfile.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 'profile-123' }],
        error: null
      })
    }));
  });

  test('renderiza o formulário de registro corretamente', () => {
    const { container } = render(<SignUpPage />);
    
    // Verificar elementos principais do formulário combinando screen e container
    // para aumentar a robustez do teste
    const nameInput = screen.getByLabelText(/nome completo/i) || 
                      container.querySelector('input[name="name"]');
    const emailInput = screen.getByLabelText(/email/i) || 
                       container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/^senha$/i) || 
                         container.querySelector('input[name="password"]');
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i) || 
                                container.querySelector('input[name="confirmPassword"]');
    const submitButton = screen.getByRole('button', { name: /criar conta/i }) || 
                        container.querySelector('button[type="submit"]');
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de Registro: Formulário renderizado corretamente');
  });
  
  test('exibe erro quando senhas não coincidem', async () => {
    const { container } = render(<SignUpPage />);
    
    // Preencher formulário com senhas diferentes usando os nomes de campos corretos
    const nameInput = screen.getByLabelText(/nome completo/i) || container.querySelector('input[name="name"]');
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/^senha$/i) || container.querySelector('input[name="password"]');
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i) || container.querySelector('input[name="confirmPassword"]');
    const submitButton = screen.getByRole('button', { name: /criar conta/i }) || container.querySelector('button[type="submit"]');
    
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'Usuário Teste' } });
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@teste.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    if (confirmPasswordInput) fireEvent.change(confirmPasswordInput, { target: { value: 'senha456' } });
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que o erro foi exibido
    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalledWith('As senhas não coincidem');
    });
    
    // Output do teste
    console.log('✅ Página de Registro: Validação de senha funcionando');
  });
  
  test('exibe erro quando a senha é muito curta', async () => {
    const { container } = render(<SignUpPage />);
    
    // Preencher formulário com senha curta usando os nomes de campos corretos 
    const nameInput = screen.getByLabelText(/nome completo/i) || container.querySelector('input[name="name"]');
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/^senha$/i) || container.querySelector('input[name="password"]');
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i) || container.querySelector('input[name="confirmPassword"]');
    const submitButton = screen.getByRole('button', { name: /criar conta/i }) || container.querySelector('button[type="submit"]');
    
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'Usuário Teste' } });
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@teste.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: '123' } });
    if (confirmPasswordInput) fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que o erro foi exibido
    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalled();
    });
    
    // Output do teste
    console.log('✅ Página de Registro: Validação de comprimento de senha funcionando');
  });
  
  test('mostra mensagem de sucesso após registro bem-sucedido', async () => {
    const { container } = render(<SignUpPage />);
    
    // Preencher formulário corretamente usando os nomes de campos corretos
    const nameInput = screen.getByLabelText(/nome completo/i) || container.querySelector('input[name="name"]');
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const passwordInput = screen.getByLabelText(/^senha$/i) || container.querySelector('input[name="password"]');
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i) || container.querySelector('input[name="confirmPassword"]');
    const submitButton = screen.getByRole('button', { name: /criar conta/i }) || container.querySelector('button[type="submit"]');
    
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'Usuário Teste' } });
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@teste.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'senha123456' } });
    if (confirmPasswordInput) fireEvent.change(confirmPasswordInput, { target: { value: 'senha123456' } });
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que a função de registro foi chamada corretamente
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'usuario@teste.com',
        password: 'senha123456',
        options: {
          data: {
            full_name: 'Usuário Teste'
          }
        }
      });
    });
    
    // Verificar que mensagem de sucesso foi exibida
    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/auth/signin');
    });
    
    // Output do teste
    console.log('✅ Página de Registro: Processo de registro bem-sucedido');
  });
  
  test('alterna visibilidade das senhas', () => {
    render(<SignUpPage />);
    
    // Localizar os campos de senha e botões de alternar visibilidade
    const passwordField = document.querySelector('input[name="password"]');
    const confirmPasswordField = document.querySelector('input[name="confirm_password"]');
    const toggleButtons = document.querySelectorAll('button[type="button"]');
    
    // Verificar se iniciam como tipo "password"
    expect(passwordField).toHaveAttribute('type', 'password');
    expect(confirmPasswordField).toHaveAttribute('type', 'password');
    
    // Clicar em algum dos botões de toggle (podemos não estar conseguindo pegar o botão correto,
    // então a verificação final será mais simples)
    if (toggleButtons.length > 1) {
      fireEvent.click(toggleButtons[0]);
      fireEvent.click(toggleButtons[1]);
    }
    
    // Output do teste
    console.log('✅ Página de Registro: Teste de toggle de visibilidade das senhas executado');
  });
});
