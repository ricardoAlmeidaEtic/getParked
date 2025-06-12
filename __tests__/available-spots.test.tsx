import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableSpotsPage from '@/app/available-spots/page';

// Mock dos hooks necessários
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

jest.mock('@/providers/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: {
      from: () => ({
        select: () => ({
          data: [
            {
              id: 'spot-1',
              name: 'Vaga Centro',
              location: 'Centro da Cidade',
              available: true,
              latitude: 38.7223,
              longitude: -9.1393,
              user_id: 'owner-1',
              type: 'public',
              total_spots: 1,
              available_spots: 1,
              status: 'active',
              created_at: '2023-01-01T12:00:00Z',
              updated_at: '2023-01-01T12:00:00Z',
              expires_at: '2024-01-01T12:00:00Z'
            },
            {
              id: 'spot-2',
              name: 'Vaga Shopping',
              location: 'Shopping Central',
              available: true,
              latitude: 38.7223,
              longitude: -9.1493,
              user_id: 'owner-2',
              type: 'public',
              total_spots: 1,
              available_spots: 1,
              status: 'active',
              created_at: '2023-01-02T15:30:00Z',
              updated_at: '2023-01-02T15:30:00Z',
              expires_at: '2024-01-02T15:30:00Z'
            },
            {
              id: 'spot-3',
              name: 'Vaga Parque',
              location: 'Parque Municipal',
              available: true,
              latitude: 38.7323,
              longitude: -9.1293,
              user_id: 'owner-1',
              type: 'public',
              total_spots: 1,
              available_spots: 1,
              status: 'active',
              created_at: '2023-01-03T10:15:00Z',
              updated_at: '2023-01-03T10:15:00Z',
              expires_at: '2024-01-03T10:15:00Z'
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
      plan_type: 'basic',
      created_at: '2023-01-01',
      credits: 100,
      avatar_url: null
    },
    loading: false
  })
}));

describe('Available Spots Page', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test('renderiza a página de vagas disponíveis com indicador de carregamento', async () => {
    render(<AvailableSpotsPage />);
    
    // Verificar se a página principal é renderizada
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Verificar se o spinner de carregamento é mostrado
    expect(screen.getByText('⏳')).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de vagas disponíveis: Renderizada com sucesso');
    console.log('✅ Indicador de carregamento: Exibido corretamente');
  });
});
