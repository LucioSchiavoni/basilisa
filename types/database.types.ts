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
          estimated_time_seconds: number;
          target_age_min: number;
          target_age_max: number;
          content: Json;
          tags: string[];
          is_active: boolean;
          deleted_at: string | null;
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
          estimated_time_seconds: number;
          target_age_min: number;
          target_age_max: number;
          content: Json;
          tags?: string[];
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          exercise_type_id?: string;
          title?: string;
          instructions?: string;
          instructions_audio_url?: string | null;
          difficulty_level?: number;
          estimated_time_seconds?: number;
          target_age_min?: number;
          target_age_max?: number;
          content?: Json;
          tags?: string[];
          is_active?: boolean;
          deleted_at?: string | null;
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
      patient_assignments: {
        Row: {
          id: string;
          patient_id: string;
          assigned_by: string;
          exercise_id: string;
          status: string;
          due_date: string | null;
          notes_for_patient: string | null;
          assigned_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          assigned_by: string;
          exercise_id: string;
          status?: string;
          due_date?: string | null;
          notes_for_patient?: string | null;
          assigned_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          patient_id?: string;
          assigned_by?: string;
          exercise_id?: string;
          status?: string;
          due_date?: string | null;
          notes_for_patient?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "patient_assignments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_assignments_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      assignment_sessions: {
        Row: {
          id: string;
          assignment_id: string | null;
          exercise_id: string;
          patient_id: string;
          is_assigned: boolean;
          attempt_number: number;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          is_completed: boolean;
        };
        Insert: {
          id?: string;
          assignment_id?: string | null;
          exercise_id: string;
          patient_id: string;
          is_assigned?: boolean;
          attempt_number?: number;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          is_completed?: boolean;
        };
        Update: {
          assignment_id?: string | null;
          exercise_id?: string;
          patient_id?: string;
          is_assigned?: boolean;
          attempt_number?: number;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          is_completed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_sessions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "patient_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_sessions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assignment_scores: {
        Row: {
          id: string;
          assignment_id: string;
          session_id: string;
          patient_id: string;
          total_questions: number;
          correct_answers: number;
          incorrect_answers: number;
          score_percentage: number;
          total_time_seconds: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          session_id: string;
          patient_id: string;
          total_questions: number;
          correct_answers: number;
          incorrect_answers: number;
          score_percentage: number;
          total_time_seconds?: number | null;
          completed_at?: string;
        };
        Update: {
          assignment_id?: string;
          session_id?: string;
          patient_id?: string;
          total_questions?: number;
          correct_answers?: number;
          incorrect_answers?: number;
          score_percentage?: number;
          total_time_seconds?: number | null;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_scores_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "patient_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_scores_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "assignment_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_scores_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_gems: {
        Row: {
          id: string;
          user_id: string;
          total_gems: number;
          gems_spent: number;
          current_streak: number;
          best_streak: number;
          last_activity_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_gems?: number;
          gems_spent?: number;
          current_streak?: number;
          best_streak?: number;
          last_activity_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          total_gems?: number;
          gems_spent?: number;
          current_streak?: number;
          best_streak?: number;
          last_activity_date?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_gems_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      gem_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          source: string;
          session_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          source: string;
          session_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          amount?: number;
          transaction_type?: string;
          source?: string;
          session_id?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "gem_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gem_transactions_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "assignment_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      assignment_results: {
        Row: {
          id: string;
          assignment_id: string;
          patient_id: string;
          session_id: string;
          question_id: string;
          patient_answer: Record<string, unknown>;
          correct_answer: Record<string, unknown>;
          is_correct: boolean;
          time_spent_seconds: number | null;
          answered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          patient_id: string;
          session_id: string;
          question_id: string;
          patient_answer: Record<string, unknown>;
          correct_answer: Record<string, unknown>;
          is_correct: boolean;
          time_spent_seconds?: number | null;
          answered_at?: string | null;
          created_at?: string;
        };
        Update: {
          assignment_id?: string;
          patient_id?: string;
          session_id?: string;
          question_id?: string;
          patient_answer?: Record<string, unknown>;
          correct_answer?: Record<string, unknown>;
          is_correct?: boolean;
          time_spent_seconds?: number | null;
          answered_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assignment_results_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "patient_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "assignment_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignment_results_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
