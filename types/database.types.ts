export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string;
          is_profile_complete: boolean;
          date_of_birth: string | null;
          phone: string | null;
          country_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string;
          is_profile_complete?: boolean;
          date_of_birth?: string | null;
          phone?: string | null;
          country_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: string;
          is_profile_complete?: boolean;
          date_of_birth?: string | null;
          phone?: string | null;
          country_code?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          created_by: string;
          exercise_type_id: string;
          title: string;
          instructions: string;
          instructions_audio_url: string | null;
          difficulty_level: number;
          estimated_time_minutes: number;
          target_age_min: number;
          target_age_max: number;
          content: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          exercise_type_id: string;
          title: string;
          instructions: string;
          instructions_audio_url?: string | null;
          difficulty_level: number;
          estimated_time_minutes: number;
          target_age_min: number;
          target_age_max: number;
          content: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          exercise_type_id?: string;
          title?: string;
          instructions?: string;
          instructions_audio_url?: string | null;
          difficulty_level?: number;
          estimated_time_minutes?: number;
          target_age_min?: number;
          target_age_max?: number;
          content?: Json;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercises_exercise_type_id_fkey";
            columns: ["exercise_type_id"];
            isOneToOne: false;
            referencedRelation: "exercise_types";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_types: {
        Row: {
          id: string;
          name: string;
          display_name: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
        };
        Update: {
          name?: string;
          display_name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
