'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type ParkingSettings = {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  total_spots: string;
  phone: string;
  opening_time: string;
  closing_time: string;
};

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<ParkingSettings>({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    total_spots: '',
    phone: '',
    opening_time: '',
    closing_time: ''
  });

  useEffect(() => {
    fetchParkingSettings();
  }, []);

  const fetchParkingSettings = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not found');

      const { data: parking, error: parkingError } = await supabase
        .from('parkings')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (parkingError) throw parkingError;
      if (!parking) throw new Error('No parking found for this user');

      setSettings({
        name: parking.name || '',
        description: parking.description || '',
        latitude: parking.latitude?.toString() || '',
        longitude: parking.longitude?.toString() || '',
        total_spots: parking.total_spots?.toString() || '',
        phone: parking.phone || '',
        opening_time: parking.opening_time || '',
        closing_time: parking.closing_time || ''
      });
    } catch (err: any) {
      console.error('Error fetching parking settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not found');

      const { error: updateError } = await supabase
        .from('parkings')
        .update({
          name: settings.name,
          description: settings.description,
          latitude: parseFloat(settings.latitude),
          longitude: parseFloat(settings.longitude),
          total_spots: parseInt(settings.total_spots),
          phone: settings.phone,
          opening_time: settings.opening_time,
          closing_time: settings.closing_time
        })
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      setSuccess('Configurações atualizadas com sucesso!');
    } catch (err: any) {
      console.error('Error updating parking settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações do Estacionamento</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome do Estacionamento
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={settings.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={settings.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={settings.latitude}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={settings.longitude}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="total_spots" className="block text-sm font-medium text-gray-700">
                  Total de Vagas
                </label>
                <input
                  type="number"
                  id="total_spots"
                  name="total_spots"
                  value={settings.total_spots}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                  required
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="opening_time" className="block text-sm font-medium text-gray-700">
                  Horário de Abertura
                </label>
                <input
                  type="time"
                  id="opening_time"
                  name="opening_time"
                  value={settings.opening_time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="closing_time" className="block text-sm font-medium text-gray-700">
                  Horário de Fechamento
                </label>
                <input
                  type="time"
                  id="closing_time"
                  name="closing_time"
                  value={settings.closing_time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 