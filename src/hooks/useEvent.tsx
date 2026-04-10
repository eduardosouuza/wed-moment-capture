import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/database';

export function useEvent(slug?: string) {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            fetchEvent(slug);
        } else {
            setLoading(false);
        }
    }, [slug]);

    const fetchEvent = async (eventSlug: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('slug', eventSlug)
                .single();

            if (error) throw error;
            setEvent(data);
        } catch (err: any) {
            console.error('Erro ao buscar evento:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createEvent = async (eventData: Partial<Event>) => {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([eventData])
                .select()
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (err: any) {
            console.error('Erro ao criar evento:', err);
            return { data: null, error: err.message };
        }
    };

    const updateEvent = async (eventId: string, updates: Partial<Event>) => {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', eventId)
                .select();

            if (error) throw error;
            return { data: data?.[0] || null, error: null };
        } catch (err: any) {
            console.error('Erro ao atualizar evento:', err);
            return { data: null, error: err.message };
        }
    };

    const deleteEvent = async (eventId: string) => {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;
            return { error: null };
        } catch (err: any) {
            console.error('Erro ao deletar evento:', err);
            return { error: err.message };
        }
    };

    return {
        event,
        loading,
        error,
        fetchEvent,
        createEvent,
        updateEvent,
        deleteEvent,
    };
}
