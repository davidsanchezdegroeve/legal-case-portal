export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      evidence_vault: {
        Row: {
          arabic_translation: string | null
          category: string | null
          created_at: string | null
          file_url: string | null
          evidence_files: Json | null
          id: string
          original_language: string | null
          title: string
          verification_code: string | null
        }
        Insert: {
          arabic_translation?: string | null
          category?: string | null
          created_at?: string | null
          file_url?: string | null
          evidence_files?: Json | null
          id?: string
          original_language?: string | null
          title: string
          verification_code?: string | null
        }
        Update: {
          arabic_translation?: string | null
          category?: string | null
          created_at?: string | null
          file_url?: string | null
          evidence_files?: Json | null
          id?: string
          original_language?: string | null
          title?: string
          verification_code?: string | null
        }
        Relationships: []
      }
      financial_claims: {
        Row: {
          actual_paid_sar: number | null
          calculated_debt: number | null
          created_at: string | null
          id: string
          item: string
          market_rate_sar: number | null
          status: string | null
        }
        Insert: {
          actual_paid_sar?: number | null
          calculated_debt?: number | null
          created_at?: string | null
          id?: string
          item: string
          market_rate_sar?: number | null
          status?: string | null
        }
        Update: {
          actual_paid_sar?: number | null
          calculated_debt?: number | null
          created_at?: string | null
          id?: string
          item?: string
          market_rate_sar?: number | null
          status?: string | null
        }
        Relationships: []
      }
      legal_dashboard: {
        Row: {
          arabic_translation: string | null
          evidence_files: Json | null
          id: string
          lawyer_id: string | null
          lawyer_recommendations: string | null
          my_requests: string | null
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_translation?: string | null
          evidence_files?: Json | null
          id?: string
          lawyer_id?: string | null
          lawyer_recommendations?: string | null
          my_requests?: string | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_translation?: string | null
          evidence_files?: Json | null
          id?: string
          lawyer_id?: string | null
          lawyer_recommendations?: string | null
          my_requests?: string | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_dashboard_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_responses: {
        Row: {
          id: string
          request_id: string
          lawyer_id: string
          recommendation: string | null
          arabic_translation: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          lawyer_id: string
          recommendation?: string | null
          arabic_translation?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          lawyer_id?: string
          recommendation?: string | null
          arabic_translation?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_responses_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_dashboard"
            referencedColumns: ["id"]
          }
        ]
      }
      download_logs: {
        Row: {
          id: string
          file_name: string
          user_agent: string | null
          downloaded_at: string
        }
        Insert: {
          id?: string
          file_name: string
          user_agent?: string | null
          downloaded_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          user_agent?: string | null
          downloaded_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          company_name: string | null
          avatar_url: string | null
          company_logo_url: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
          company_name?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          company_name?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          arabic_translation: string | null
          created_at: string | null
          description: string | null
          event_title: string
          id: string
          is_bad_faith_indicator: boolean | null
          proof_link_id: string | null
          timestamp: string
        }
        Insert: {
          arabic_translation?: string | null
          created_at?: string | null
          description?: string | null
          event_title: string
          id?: string
          is_bad_faith_indicator?: boolean | null
          proof_link_id?: string | null
          timestamp: string
        }
        Update: {
          arabic_translation?: string | null
          created_at?: string | null
          description?: string | null
          event_title?: string
          id?: string
          is_bad_faith_indicator?: boolean | null
          proof_link_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_proof_link_id_fkey"
            columns: ["proof_link_id"]
            isOneToOne: false
            referencedRelation: "evidence_vault"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
