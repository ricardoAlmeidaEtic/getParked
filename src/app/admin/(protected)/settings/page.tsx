'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Use custom SettingsMapComponent with no limitations
const SettingsMapComponent = dynamic(() => import('./components/SettingsMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Loading map...</div>
    </div>
  )
});

type ParkingSettings = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  hourly_rate: string;
  opening_time: string;
  closing_time: string;
  phone: string;
};

export default function Settings() {
  const { user, supabase } = useAdminSupabase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreatingSpot, setIsCreatingSpot] = useState(true); // Set to true to enable marker interaction
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const [settings, setSettings] = useState<ParkingSettings>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    hourly_rate: '',
    opening_time: '',
    closing_time: '',
    phone: ''
  });

  useEffect(() => {
    fetchParkingSettings();
  }, []);

  // Set initial marker position when settings are loaded
  useEffect(() => {
    if (settings.latitude && settings.longitude) {
      const position = L.latLng(parseFloat(settings.latitude), parseFloat(settings.longitude));
      handleMarkerPositionChange(position);
    }
  }, [settings.latitude, settings.longitude]);

  const fetchParkingSettings = async () => {
    try {
      if (!user) throw new Error('User not found');

      const { data: parking, error: parkingError } = await supabase
        .from('parkings')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (parkingError) throw parkingError;
      if (!parking) throw new Error('No parking found for this user');

      // Also fetch from private_parking_markers table
      const { data: marker, error: markerError } = await supabase
        .from('private_parking_markers')
        .select('*')
        .eq('parking_id', parking.id)
        .single();

      // Note: markerError is not thrown as it might not exist yet (for old parkings)

      setSettings({
        name: parking.name || '',
        address: parking.address || '',
        latitude: parking.latitude?.toString() || '',
        longitude: parking.longitude?.toString() || '',
        hourly_rate: parking.hourly_rate?.toString() || '',
        opening_time: marker?.opening_time || '08:00',
        closing_time: marker?.closing_time || '22:00',
        phone: marker?.phone || ''
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
      if (!user) throw new Error('User not found');

      // First get the parking ID
      const { data: parking, error: fetchError } = await supabase
        .from('parkings')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!parking) throw new Error('No parking found for this user');

      // Update parkings table
      const { error: updateError } = await supabase
        .from('parkings')
        .update({
          name: settings.name,
          address: settings.address,
          latitude: parseFloat(settings.latitude),
          longitude: parseFloat(settings.longitude),
          hourly_rate: parseFloat(settings.hourly_rate)
        })
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      // Update or insert into private_parking_markers table
      const { error: markerError } = await supabase
        .from('private_parking_markers')
        .upsert({
          parking_id: parking.id,
          parking_name: settings.name,
          latitude: parseFloat(settings.latitude),
          longitude: parseFloat(settings.longitude),
          opening_time: settings.opening_time,
          closing_time: settings.closing_time,
          phone: settings.phone
        }, {
          onConflict: 'parking_id'
        });

      if (markerError) throw markerError;

      setSuccess('Configurações atualizadas com sucesso!');
      
      // Refresh the page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

  // Handle marker position changes from MapComponent
  const handleMarkerPositionChange = (position: L.LatLng | null) => {
    console.log('SETTINGS: handleMarkerPositionChange called with:', position);
    if (position) {
      console.log('SETTINGS: Updating settings with lat:', position.lat, 'lng:', position.lng);
      setSettings(prev => ({
        ...prev,
        latitude: position.lat.toString(),
        longitude: position.lng.toString()
      }));
    }
  };

  // Dummy handlers to satisfy MapComponent interface
  const handleMarkerCreated = () => {
    // Do nothing for settings use case
  };

  const handleUserPositionChange = (position: L.LatLng) => {
    setUserPosition(position);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações do Estacionamento</h1>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">
                  Taxa por Hora (€)
                </label>
                <input
                  type="number"
                  id="hourly_rate"
                  name="hourly_rate"
                  value={settings.hourly_rate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="+351 123 456 789"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Localização
                </label>
                <div className="mt-2">
                  <div className="h-[400px] rounded-md overflow-hidden border border-gray-300">
                    <SettingsMapComponent 
                      isCreatingSpot={isCreatingSpot}
                      onMarkerPositionChange={handleMarkerPositionChange}
                      onMarkerCreated={handleMarkerCreated}
                      onUserPositionChange={handleUserPositionChange}
                      initialPosition={
                        settings.latitude && settings.longitude 
                          ? { lat: parseFloat(settings.latitude), lng: parseFloat(settings.longitude) }
                          : undefined
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Clique no mapa para ajustar a localização do estacionamento
                  </p>
                </div>
              </div>


            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 