'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';

type Parking = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
};

type ParkingMarker = {
  id: string;
  parking_id: string;
  parking_name: string;
  latitude: number;
  longitude: number;
  available_spots: number;
  opening_time: string;
  closing_time: string;
  phone: string;
};

export default function ParkingManagement() {
  const { user } = useAdminSupabase();
  const [parking, setParking] = useState<Parking | null>(null);
  const [marker, setMarker] = useState<ParkingMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    available_spots: 1,
    opening_time: '08:00',
    closing_time: '22:00',
    phone: ''
  });

  useEffect(() => {
    fetchParkingData();
  }, [user]);

  const fetchParkingData = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      // Fetch parking data
      const { data: parkingData, error: parkingError } = await supabase
        .from('parkings')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (parkingError) throw parkingError;
      if (!parkingData) throw new Error('No parking found');

      setParking(parkingData);

      // Fetch marker data
      const { data: markerData, error: markerError } = await supabase
        .from('private_parking_markers')
        .select('*')
        .eq('parking_id', parkingData.id)
        .single();

      if (markerError) {
        console.log('No marker found, using defaults');
        setMarker(null);
        setFormData({
          available_spots: 1,
          opening_time: '08:00',
          closing_time: '22:00',
          phone: ''
        });
      } else {
        setMarker(markerData);
        setFormData({
          available_spots: markerData.available_spots || 1,
          opening_time: markerData.opening_time || '08:00',
          closing_time: markerData.closing_time || '22:00',
          phone: markerData.phone || ''
        });
      }
    } catch (err: any) {
      console.error('Error fetching parking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parking) return;

    try {
      // Update or insert marker data
      const { error } = await supabase
        .from('private_parking_markers')
        .upsert({
          parking_id: parking.id,
          parking_name: parking.name,
          latitude: parking.latitude,
          longitude: parking.longitude,
          available_spots: formData.available_spots,
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          phone: formData.phone
        }, {
          onConflict: 'parking_id'
        });

      if (error) throw error;

      // Refresh data
      await fetchParkingData();
      setEditing(false);
    } catch (err: any) {
      console.error('Error updating parking data:', err);
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'available_spots' ? parseInt(value) || 1 : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum estacionamento encontrado</p>
          <a 
            href="/admin/register_park" 
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            Registrar Estacionamento
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciar Estacionamento</h1>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">{parking.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="text-sm font-medium text-gray-900">{parking.address}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Taxa por Hora</p>
                <p className="text-2xl font-semibold text-green-700">€{parking.hourly_rate}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Vagas Disponíveis</p>
                <p className="text-2xl font-semibold text-blue-700">
                  {marker?.available_spots || formData.available_spots}
                </p>
              </div>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vagas Disponíveis
                  </label>
                  <input
                    type="number"
                    name="available_spots"
                    value={formData.available_spots}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+351 123 456 789"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Abertura
                  </label>
                  <input
                    type="time"
                    name="opening_time"
                    value={formData.opening_time}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Fechamento
                  </label>
                  <input
                    type="time"
                    name="closing_time"
                    value={formData.closing_time}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      available_spots: marker?.available_spots || 1,
                      opening_time: marker?.opening_time || '08:00',
                      closing_time: marker?.closing_time || '22:00',
                      phone: marker?.phone || ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-500">Vagas Disponíveis:</span>
                  <span className="font-semibold text-gray-900">
                    {marker?.available_spots || 'Não definido'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-500">Telefone:</span>
                  <span className="font-semibold text-gray-900">
                    {marker?.phone || 'Não definido'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-500">Abertura:</span>
                  <span className="font-semibold text-gray-900">
                    {marker?.opening_time || 'Não definido'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-500">Fechamento:</span>
                  <span className="font-semibold text-gray-900">
                    {marker?.closing_time || 'Não definido'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
                >
                  Editar Informações
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/admin/settings" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <h4 className="font-medium text-gray-900">Configurações</h4>
              <p className="text-sm text-gray-500 mt-1">Editar nome, endereço e localização</p>
            </a>
            <a 
              href="/admin/dashboard" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <h4 className="font-medium text-gray-900">Dashboard</h4>
              <p className="text-sm text-gray-500 mt-1">Ver estatísticas e reservas</p>
            </a>
            <a 
              href="/admin/reservations" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <h4 className="font-medium text-gray-900">Reservas</h4>
              <p className="text-sm text-gray-500 mt-1">Gerenciar reservas ativas</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 