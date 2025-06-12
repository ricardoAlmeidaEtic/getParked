import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlanosPage from '@/app/planos/page';

// Mock dos hooks necessários
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

jest.mock('@/components/ui/toast/toast-config', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  }
}));

jest.mock('@/providers/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: {
      from: () => ({
        select: () => ({
          data: [
            {
              id: 'free-plan',
              name: 'Plano Gratuito',
              price: 0,
              search_limit: 10,
              vehicle_limit: 1,
              allow_reservations: false,
              realtime_navigation: false,
              priority_support: false
            },
            {
              id: 'basic-plan',
              name: 'Plano Básico',
              price: 9.90,
              search_limit: 50,
              vehicle_limit: 3,
              allow_reservations: true,
              realtime_navigation: false,
              priority_support: false
            },
            {
              id: 'premium-plan',
              name: 'Plano Premium',
              price: 19.90,
              search_limit: 100,
              vehicle_limit: 5,
              allow_reservations: true,
              realtime_navigation: true,
              priority_support: true
            }
          ]
        })
      })
    },
    user: { id: 'user-123', email: 'teste@example.com' }
  })
}));

jest.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: {
      id: 'profile-123',
      full_name: 'Usuário Teste',
      email: 'teste@example.com',
      plan_type: 'free',
      created_at: '2023-01-01',
      credits: 0,
      avatar_url: null
    },
    refreshProfile: jest.fn(),
    loading: false
  })
}));

// Mock dos componentes que usam framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>
}));

// Mock do modal de pagamento
jest.mock('@/app/planos/components/PaymentModal', () => ({
  PaymentModal: ({
    isOpen,
    onClose,
    planName,
    planType,
    price
  }: {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    planType: string;
    price: number;
  }) => (
    isOpen ? 
      <div data-testid="payment-modal">
        <div>Pagamento para: {planName}</div>
        <div>Preço: {price}</div>
        <button data-testid="confirm-payment">Confirmar Pagamento</button>
      </div> : null
  )
}));

describe('Planos Page', () => {
  test('renderiza a página de planos', async () => {
    render(<PlanosPage />);
    
    // Verificar se a página principal é renderizada
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Verificar se o título principal é exibido
    expect(screen.getByText('Escolha o Plano Ideal')).toBeInTheDocument();
    
    // Verificar se as abas de tipo de plano estão presentes
    expect(screen.getByRole('tab', { name: /mensal/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /anual/i })).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de planos: Renderizada com sucesso');
    console.log('✅ Seleção de períodos: Exibida corretamente');
  });
});
