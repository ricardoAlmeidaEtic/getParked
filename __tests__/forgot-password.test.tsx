// filepath: /home/msousa/etic/Projeto-Final-Final/getParked/__tests__/forgot-password.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordPage from '@/app/auth/forgot-password/page';

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
const mockResetPasswordForEmail = jest.fn();

jest.mock('@/providers/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail
      }
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
  Mail: () => <div data-testid="mail-icon" />
}));

// Mock do window.location
beforeAll(() => {
  // Salvar propriedades importantes
  const originalOrigin = window.location.origin;
  const originalHref = window.location.href;
  
  // Mock das propriedades sem recriar o objeto inteiro
  Object.defineProperty(window.location, 'origin', {
    configurable: true,
    value: 'https://getparked.example.com',
  });
  
  Object.defineProperty(window.location, 'href', {
    configurable: true,
    value: 'https://getparked.example.com/auth/forgot-password',
  });
});

afterAll(() => {
  // Restaura o comportamento original
  jest.restoreAllMocks();
});

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    // Reset dos mocks entre testes
    jest.clearAllMocks();
    resetToastMocks();
    
    // Configuração padrão para sucesso
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null
    });
  });

  test('renderiza o formulário de recuperação de senha corretamente', () => {
    const { container } = render(<ForgotPasswordPage />);
    
    // Verificar elementos principais do formulário usando screen e container
    // para maior robustez
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const submitButton = screen.getByRole('button', { name: /enviar email de recuperação/i }) || 
                        container.querySelector('button[type="submit"]');
    
    expect(emailInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de Recuperação de Senha: Formulário renderizado corretamente');
  });
  
  test('exibe mensagem de sucesso após envio do email de recuperação', async () => {
    const { container } = render(<ForgotPasswordPage />);
    
    // Preencher formulário usando abordagem mais robusta
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const submitButton = screen.getByRole('button', { name: /enviar email de recuperação/i }) || 
                       container.querySelector('button[type="submit"]');
    
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@teste.com' } });
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que o email foi enviado com sucesso
    await waitFor(() => {
      // Verificar que supabase.auth.resetPasswordForEmail foi chamado com parâmetros corretos
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'usuario@teste.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password')
        })
      );
      
      // Verificar toast de sucesso e elemento visual
      expect(toastSuccessMock).toHaveBeenCalled();
      const successAlert = screen.queryByText(/Email de recuperação enviado/i);
      expect(successAlert).toBeInTheDocument();
    });
    
    // Output do teste
    console.log('✅ Página de Recuperação de Senha: Envio de email bem-sucedido');
  });
  
  test('exibe erro quando ocorre falha ao enviar email', async () => {
    // Mock para simular erro
    mockResetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { message: 'Email não encontrado' }
    });
    
    const { container } = render(<ForgotPasswordPage />);
    
    // Preencher formulário
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const submitButton = screen.getByRole('button', { name: /enviar email de recuperação/i }) || 
                        container.querySelector('button[type="submit"]');
    
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'email@inexistente.com' } });
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que mensagem de erro aparece
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'email@inexistente.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password')
        })
      );
      expect(toastErrorMock).toHaveBeenCalledWith('Email não encontrado');
    });
    
    // Output do teste
    console.log('✅ Página de Recuperação de Senha: Tratamento de erro funcionando');
  });
  
  test('desabilita o botão durante o carregamento', async () => {
    // Simular um delay na resposta da API
    mockResetPasswordForEmail.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {},
            error: null
          });
        }, 100);
      });
    });
    
    const { container } = render(<ForgotPasswordPage />);
    
    // Preencher formulário
    const emailInput = screen.getByLabelText(/email/i) || container.querySelector('input[name="email"]');
    const submitButton = screen.getByRole('button', { name: /enviar email de recuperação/i }) || 
                        container.querySelector('button[type="submit"]');
    
    // Verificar que o botão está habilitado inicialmente
    expect(submitButton).not.toBeDisabled();
    
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'usuario@teste.com' } });
    if (submitButton) fireEvent.click(submitButton);
    
    // Verificar que o botão fica desabilitado durante o carregamento
    expect(submitButton).toBeDisabled();
    
    // Espera o botão de carregamento mostrar "Enviando..."
    const loadingText = await screen.findByText(/enviando/i);
    expect(loadingText).toBeInTheDocument();
    
    // Após o carregamento, verificar que a API foi chamada
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalled();
    });
    
    // Output do teste
    console.log('✅ Página de Recuperação de Senha: Estado de carregamento correto');
  });
});
