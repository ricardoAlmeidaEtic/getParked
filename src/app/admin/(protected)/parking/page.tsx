'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Parking = {
  id: string;
  name: string;
  total_spots: number;
  occupied_spots: number;
  unavailable_spots: number;
};

export default function ParkingManagement() {
  const [parking, setParking] = useState<Parking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    occupied_spots: 0,
    unavailable_spots: 0
  });

  useEffect(() => {
    fetchParking();
  }, []);

  const fetchParking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('parkings')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No parking found');

      setParking(data);
      setFormData({
        occupied_spots: data.occupied_spots || 0,
        unavailable_spots: data.unavailable_spots || 0
      });
    } catch (err: any) {
      console.error('Error fetching parking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parking) return;

    try {
      const { error } = await supabase
        .from('parkings')
        .update({
          occupied_spots: formData.occupied_spots,
          unavailable_spots: formData.unavailable_spots,
          updated_at: new Date().toISOString()
        })
        .eq('id', parking.id);

      if (error) throw error;

      setParking({
        ...parking,
        occupied_spots: formData.occupied_spots,
        unavailable_spots: formData.unavailable_spots
      });
      setEditing(false);
    } catch (err: any) {
      console.error('Error updating parking:', err);
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    // Ensure the sum doesn't exceed total_spots
    if (parking && name === 'occupied_spots') {
      if (numValue + formData.unavailable_spots > parking.total_spots) {
        return;
      }
    }
    if (parking && name === 'unavailable_spots') {
      if (numValue + formData.occupied_spots > parking.total_spots) {
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
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
        </div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum estacionamento encontrado</p>
        </div>
      </div>
    );
  }

  const availableSpots = parking.total_spots - (parking.occupied_spots + parking.unavailable_spots);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciar Vagas</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{parking.name}</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total de Vagas</p>
                <p className="text-2xl font-semibold">{parking.total_spots}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Vagas Disponíveis</p>
                <p className="text-2xl font-semibold text-green-600">{availableSpots}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Vagas Ocupadas</p>
                <p className="text-2xl font-semibold text-blue-600">{parking.occupied_spots}</p>
              </div>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vagas Ocupadas
                </label>
                <input
                  type="number"
                  name="occupied_spots"
                  value={formData.occupied_spots}
                  onChange={handleChange}
                  min="0"
                  max={parking.total_spots - formData.unavailable_spots}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vagas Indisponíveis
                </label>
                <input
                  type="number"
                  name="unavailable_spots"
                  value={formData.unavailable_spots}
                  onChange={handleChange}
                  min="0"
                  max={parking.total_spots - formData.occupied_spots}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      occupied_spots: parking.occupied_spots,
                      unavailable_spots: parking.unavailable_spots
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Vagas Ocupadas</p>
                  <p className="text-lg font-semibold">{parking.occupied_spots}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vagas Indisponíveis</p>
                  <p className="text-lg font-semibold">{parking.unavailable_spots}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Editar Vagas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 