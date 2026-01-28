import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TripExpense {
  id: string;
  user_id: string;
  trip_name: string;
  client_name: string | null;
  start_date: string;
  end_date: string;
  purpose: string | null;
  flights: number;
  lodging: number;
  ground_transport: number;
  meals: number;
  per_diem: number;
  other_expenses: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripExpenseInput {
  trip_name: string;
  client_name?: string;
  start_date: string;
  end_date: string;
  purpose?: string;
  flights?: number;
  lodging?: number;
  ground_transport?: number;
  meals?: number;
  per_diem?: number;
  other_expenses?: number;
  notes?: string;
}

export interface TripTotals {
  flights: number;
  lodging: number;
  groundTransport: number;
  meals: number;
  mealsDeductible: number; // 50% of meals
  perDiem: number;
  otherExpenses: number;
  total: number;
  totalDeductible: number; // Total with meals at 50%
  tripCount: number;
}

export const useTripExpenses = () => {
  const [trips, setTrips] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrips = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trip_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trip expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const addTrip = async (input: TripExpenseInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trip_expenses')
        .insert({
          user_id: user.id,
          trip_name: input.trip_name,
          client_name: input.client_name || null,
          start_date: input.start_date,
          end_date: input.end_date,
          purpose: input.purpose || null,
          flights: input.flights || 0,
          lodging: input.lodging || 0,
          ground_transport: input.ground_transport || 0,
          meals: input.meals || 0,
          per_diem: input.per_diem || 0,
          other_expenses: input.other_expenses || 0,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setTrips((prev) => [data, ...prev]);
      toast({
        title: 'Trip Added',
        description: `${input.trip_name} has been logged`,
      });
      return data;
    } catch (error) {
      console.error('Error adding trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to add trip expense',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTrip = async (id: string, input: Partial<TripExpenseInput>) => {
    try {
      const { data, error } = await supabase
        .from('trip_expenses')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTrips((prev) => prev.map((t) => (t.id === id ? data : t)));
      toast({
        title: 'Trip Updated',
        description: 'Trip expense has been updated',
      });
      return data;
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trip expense',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: 'Trip Deleted',
        description: 'Trip expense has been removed',
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete trip expense',
        variant: 'destructive',
      });
    }
  };

  // Calculate totals for tax purposes
  const calculateTotals = useCallback((): TripTotals => {
    const totals = trips.reduce(
      (acc, trip) => {
        acc.flights += Number(trip.flights) || 0;
        acc.lodging += Number(trip.lodging) || 0;
        acc.groundTransport += Number(trip.ground_transport) || 0;
        acc.meals += Number(trip.meals) || 0;
        acc.perDiem += Number(trip.per_diem) || 0;
        acc.otherExpenses += Number(trip.other_expenses) || 0;
        return acc;
      },
      {
        flights: 0,
        lodging: 0,
        groundTransport: 0,
        meals: 0,
        perDiem: 0,
        otherExpenses: 0,
      }
    );

    const mealsDeductible = Math.round(totals.meals * 0.5);
    const total =
      totals.flights +
      totals.lodging +
      totals.groundTransport +
      totals.meals +
      totals.perDiem +
      totals.otherExpenses;
    const totalDeductible =
      totals.flights +
      totals.lodging +
      totals.groundTransport +
      mealsDeductible +
      totals.perDiem +
      totals.otherExpenses;

    return {
      ...totals,
      mealsDeductible,
      total,
      totalDeductible,
      tripCount: trips.length,
    };
  }, [trips]);

  return {
    trips,
    loading,
    addTrip,
    updateTrip,
    deleteTrip,
    totals: calculateTotals(),
    refetch: fetchTrips,
  };
};
