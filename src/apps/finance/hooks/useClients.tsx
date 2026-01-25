import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceAuth } from './useFinanceAuth';
import { toast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  monthly_retainer: number;
  payment_method: 'check' | 'direct_deposit' | 'quickbooks' | 'stripe';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type ClientInsert = Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ClientUpdate = Partial<ClientInsert>;

export const useClients = () => {
  const { user } = useFinanceAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error fetching clients', description: error.message, variant: 'destructive' });
    } else {
      setClients(data as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const addClient = async (client: ClientInsert) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding client', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setClients([...clients, data as Client]);
    toast({ title: 'Client added', description: `${client.name} has been added.` });
    return { data };
  };

  const updateClient = async (id: string, updates: ClientUpdate) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error updating client', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setClients(clients.map(c => c.id === id ? data as Client : c));
    toast({ title: 'Client updated' });
    return { data };
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting client', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setClients(clients.filter(c => c.id !== id));
    toast({ title: 'Client deleted' });
    return { success: true };
  };

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
};
