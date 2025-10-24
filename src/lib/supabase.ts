import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'municipal_admin' | 'super_admin';
  points: number;
  avatar_url?: string;
  created_at: string;
};

export type Report = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'basura' | 'contaminacion' | 'tala_ilegal' | 'mal_uso_espacios';
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado';
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string;
  priority: 'baja' | 'media' | 'alta';
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
};

export type ReportUpdate = {
  id: string;
  report_id: string;
  user_id: string;
  status?: 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado';
  comment: string;
  created_at: string;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  points_required: number;
  category: 'descuento' | 'reconocimiento' | 'beneficio';
  image_url?: string;
  available_quantity?: number;
  is_active: boolean;
  created_at: string;
};

export type UserReward = {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
  status: 'pendiente' | 'entregado' | 'usado';
};

export type Activity = {
  id: string;
  user_id: string;
  activity_type: 'reporte_valido' | 'reciclaje' | 'educacion' | 'compartir';
  points_earned: number;
  description: string;
  created_at: string;
};

export type EducationalContent = {
  id: string;
  title: string;
  content: string;
  category: 'campana' | 'consejo' | 'actividad';
  image_url?: string;
  author_id: string;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

export type ContentInteraction = {
  id: string;
  user_id: string;
  content_id: string;
  interaction_type: 'view' | 'like' | 'complete';
  created_at: string;
};
