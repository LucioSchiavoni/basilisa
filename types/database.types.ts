export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assignment_results: {
        Row: {
          answered_at: string
          assignment_id: string | null
          correct_answer: Json
          id: string
          is_correct: boolean
          patient_answer: Json
          patient_id: string
          question_id: string
          session_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answered_at?: string
          assignment_id?: string | null
          correct_answer: Json
          id?: string
          is_correct: boolean
          patient_answer: Json
          patient_id: string
          question_id: string
          session_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answered_at?: string
          assignment_id?: string | null
          correct_answer?: Json
          id?: string
          is_correct?: boolean
          patient_answer?: Json
          patient_id?: string
          question_id?: string
          session_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_results_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "patient_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assignment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_scores: {
        Row: {
          assignment_id: string | null
          completed_at: string
          correct_answers: number
          id: string
          incorrect_answers: number
          patient_id: string
          score_percentage: number
          session_id: string
          total_questions: number
          total_time_seconds: number | null
        }
        Insert: {
          assignment_id?: string | null
          completed_at?: string
          correct_answers: number
          id?: string
          incorrect_answers: number
          patient_id: string
          score_percentage: number
          session_id: string
          total_questions: number
          total_time_seconds?: number | null
        }
        Update: {
          assignment_id?: string | null
          completed_at?: string
          correct_answers?: number
          id?: string
          incorrect_answers?: number
          patient_id?: string
          score_percentage?: number
          session_id?: string
          total_questions?: number
          total_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_scores_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "patient_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_scores_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assignment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_sessions: {
        Row: {
          assignment_id: string | null
          attempt_number: number
          duration_seconds: number | null
          ended_at: string | null
          exercise_id: string | null
          id: string
          is_assigned: boolean
          is_completed: boolean
          patient_id: string
          reading_time_seconds: number | null
          started_at: string
        }
        Insert: {
          assignment_id?: string | null
          attempt_number?: number
          duration_seconds?: number | null
          ended_at?: string | null
          exercise_id?: string | null
          id?: string
          is_assigned?: boolean
          is_completed?: boolean
          patient_id: string
          reading_time_seconds?: number | null
          started_at?: string
        }
        Update: {
          assignment_id?: string | null
          attempt_number?: number
          duration_seconds?: number | null
          ended_at?: string | null
          exercise_id?: string | null
          id?: string
          is_assigned?: boolean
          is_completed?: boolean
          patient_id?: string
          reading_time_seconds?: number | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "patient_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_types: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          content: Json
          created_at: string
          created_by: string
          deleted_at: string | null
          difficulty_level: number
          estimated_time_seconds: number | null
          exercise_type_id: string
          id: string
          instructions: string | null
          instructions_audio_url: string | null
          is_active: boolean
          tags: string[] | null
          target_age_max: number | null
          target_age_min: number | null
          title: string
          updated_at: string
          world_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          created_by: string
          deleted_at?: string | null
          difficulty_level?: number
          estimated_time_seconds?: number | null
          exercise_type_id: string
          id?: string
          instructions?: string | null
          instructions_audio_url?: string | null
          is_active?: boolean
          tags?: string[] | null
          target_age_max?: number | null
          target_age_min?: number | null
          title: string
          updated_at?: string
          world_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          difficulty_level?: number
          estimated_time_seconds?: number | null
          exercise_type_id?: string
          id?: string
          instructions?: string | null
          instructions_audio_url?: string | null
          is_active?: boolean
          tags?: string[] | null
          target_age_max?: number | null
          target_age_min?: number | null
          title?: string
          updated_at?: string
          world_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_exercise_type_id_fkey"
            columns: ["exercise_type_id"]
            isOneToOne: false
            referencedRelation: "exercise_types"
            referencedColumns: ["id"]
          },
        ]
      }
      gem_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          session_id: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gem_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assignment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gem_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          completed_at: string | null
          due_date: string | null
          exercise_id: string
          id: string
          notes_for_patient: string | null
          patient_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          completed_at?: string | null
          due_date?: string | null
          exercise_id: string
          id?: string
          notes_for_patient?: string | null
          patient_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          completed_at?: string | null
          due_date?: string | null
          exercise_id?: string
          id?: string
          notes_for_patient?: string | null
          patient_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assignments_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          is_profile_complete: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          is_profile_complete?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_profile_complete?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      storage_files: {
        Row: {
          bucket_id: string
          created_at: string | null
          exercise_id: string | null
          file_path: string
          file_size: number
          file_type: string | null
          id: string
          mime_type: string
          user_id: string
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          exercise_id?: string | null
          file_path: string
          file_size: number
          file_type?: string | null
          id?: string
          mime_type: string
          user_id: string
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          exercise_id?: string | null
          file_path?: string
          file_size?: number
          file_type?: string | null
          id?: string
          mime_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_files_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gems: {
        Row: {
          best_streak: number
          created_at: string
          current_streak: number
          gems_spent: number
          id: string
          last_activity_date: string | null
          total_gems: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          gems_spent?: number
          id?: string
          last_activity_date?: string | null
          total_gems?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          gems_spent?: number
          id?: string
          last_activity_date?: string | null
          total_gems?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gems_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      world_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          is_bonus: boolean
          position: number
          world_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          is_bonus?: boolean
          position?: number
          world_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          is_bonus?: boolean
          position?: number
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "world_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "world_exercises_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      worlds: {
        Row: {
          background_config: Json | null
          character_image_url: string | null
          created_at: string | null
          description: string | null
          difficulty_label: string | null
          difficulty_level: number | null
          display_name: string
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          theme_slug: string
          therapeutic_description: string | null
          updated_at: string | null
        }
        Insert: {
          background_config?: Json | null
          character_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_label?: string | null
          difficulty_level?: number | null
          display_name: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          theme_slug: string
          therapeutic_description?: string | null
          updated_at?: string | null
        }
        Update: {
          background_config?: Json | null
          character_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_label?: string | null
          difficulty_level?: number | null
          display_name?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          theme_slug?: string
          therapeutic_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: never; Returns: string }
      increment_user_gems: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
