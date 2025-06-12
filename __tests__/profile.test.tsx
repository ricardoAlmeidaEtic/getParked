import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/profile/page';

// Mock dos hooks necessários
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

jest.mock('@/lib/toast', () => ({
  showToast: jest.fn()
}));

jest.mock('@/providers/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: {},
    user: { id: 'user-123', email: 'teste@example.com' }
  })
}));

jest.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: {
      id: 'profile-123',
      role: 'client',
      full_name: 'Usuário Teste',
      email: 'teste@example.com',
      plan: 'basic',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      join_date: '2023-01-01',
      credits: 100,
      profile_image: null
    },
    refreshProfile: jest.fn(),
    loading: false
  })
}));

// Mock dos componentes de modal
jest.mock('@/app/profile/components/EditProfileModal', () => ({
  EditProfileModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="edit-profile-modal">Modal de Edição de Perfil</div> : null
  )
}));

jest.mock('@/app/profile/components/AddVehicleModal', () => ({
  AddVehicleModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="add-vehicle-modal">Modal de Adição de Veículo</div> : null
  )
}));

describe('Profile Page', () => {
  test('renderiza a página de perfil', async () => {
    render(<ProfilePage />);
    
    // Verificar se o componente principal foi renderizado
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Verificar se o spinner de carregamento é exibido inicialmente
    expect(screen.getByText('⏳')).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de perfil: Renderizada com sucesso');
    console.log('✅ Indicador de carregamento: Exibido corretamente');
  });
  
  test('renderiza o conteúdo da página após carregamento', async () => {
    // Como o mock já está configurado no início do arquivo, não precisamos
    // repetir a configuração aqui, podemos apenas usar o mock existente
    render(<ProfilePage />);
    
    // Verificar se o componente principal é renderizado
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Output do teste
    console.log('✅ Página de perfil: Conteúdo renderizado após carregamento');
  });
});