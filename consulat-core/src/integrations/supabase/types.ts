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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          agent_id: string | null
          appointment_date: string
          citizen_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          organization_id: string
          request_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          appointment_date: string
          citizen_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          request_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          appointment_date?: string
          citizen_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          request_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          created_at: string
          documents: Json | null
          family: Json | null
          id: string
          parent_profile_id: string
          personal: Json
          status: Database["public"]["Enums"]["profile_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          family?: Json | null
          id?: string
          parent_profile_id: string
          personal?: Json
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          documents?: Json | null
          family?: Json | null
          id?: string
          parent_profile_id?: string
          personal?: Json
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          channel: Database["public"]["Enums"]["notification_channel"] | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          request_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          request_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          request_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          enabled_services: string[] | null
          id: string
          jurisdiction: string[]
          name: string
          settings: Json | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          enabled_services?: string[] | null
          id?: string
          jurisdiction: string[]
          name: string
          settings?: Json | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          enabled_services?: string[] | null
          id?: string
          jurisdiction?: string[]
          name?: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: Json | null
          consular_card: Json | null
          consulate_file: string | null
          contacts: Json | null
          created_at: string
          date_of_birth: string | null
          documents: Json | null
          email: string
          emergency_contacts: Json | null
          family: Json | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          organization_id: string | null
          personal: Json | null
          phone: string | null
          profession_situation: Json | null
          residence_country: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          consular_card?: Json | null
          consulate_file?: string | null
          contacts?: Json | null
          created_at?: string
          date_of_birth?: string | null
          documents?: Json | null
          email: string
          emergency_contacts?: Json | null
          family?: Json | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          organization_id?: string | null
          personal?: Json | null
          phone?: string | null
          profession_situation?: Json | null
          residence_country?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          consular_card?: Json | null
          consulate_file?: string | null
          contacts?: Json | null
          created_at?: string
          date_of_birth?: string | null
          documents?: Json | null
          email?: string
          emergency_contacts?: Json | null
          family?: Json | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          organization_id?: string | null
          personal?: Json | null
          phone?: string | null
          profession_situation?: Json | null
          residence_country?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          attached_documents: string[] | null
          citizen_email: string
          citizen_id: string
          citizen_name: string
          citizen_phone: string | null
          created_at: string
          description: string | null
          expected_completion_date: string | null
          id: string
          internal_notes: string | null
          organization_id: string | null
          priority: Database["public"]["Enums"]["request_priority"]
          required_documents: string[] | null
          service_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          subject: string
          type: Database["public"]["Enums"]["request_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          attached_documents?: string[] | null
          citizen_email: string
          citizen_id: string
          citizen_name: string
          citizen_phone?: string | null
          created_at?: string
          description?: string | null
          expected_completion_date?: string | null
          id?: string
          internal_notes?: string | null
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["request_priority"]
          required_documents?: string[] | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subject: string
          type: Database["public"]["Enums"]["request_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          attached_documents?: string[] | null
          citizen_email?: string
          citizen_id?: string
          citizen_name?: string
          citizen_phone?: string | null
          created_at?: string
          description?: string | null
          expected_completion_date?: string | null
          id?: string
          internal_notes?: string | null
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["request_priority"]
          required_documents?: string[] | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subject?: string
          type?: Database["public"]["Enums"]["request_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          price: number | null
          processing_time_days: number | null
          required_documents: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          price?: number | null
          processing_time_days?: number | null
          required_documents?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          price?: number | null
          processing_time_days?: number | null
          required_documents?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "agent" | "citizen"
      appointment_status:
        | "SCHEDULED"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW"
      gender: "male" | "female"
      notification_channel: "app" | "email" | "sms"
      notification_status: "pending" | "sent" | "delivered" | "failed" | "read"
      notification_type:
        | "updated"
        | "reminder"
        | "confirmation"
        | "cancellation"
        | "communication"
        | "important_communication"
        | "appointment_confirmation"
        | "appointment_reminder"
        | "appointment_cancellation"
        | "consular_registration_submitted"
        | "consular_registration_validated"
        | "consular_registration_rejected"
        | "consular_card_ready"
        | "consular_registration_completed"
        | "feedback"
      organization_type:
        | "CONSULAT_GENERAL"
        | "CONSULAT"
        | "AMBASSADE"
        | "HAUT_COMMISSARIAT"
        | "MISSION_PERMANENTE"
      profile_status: "draft" | "active" | "inactive" | "pending" | "suspended"
      request_priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
      request_status:
        | "PENDING"
        | "IN_PROGRESS"
        | "AWAITING_DOCUMENTS"
        | "VALIDATED"
        | "REJECTED"
        | "COMPLETED"
      request_type:
        | "PASSPORT"
        | "VISA"
        | "CIVIL_REGISTRY"
        | "LEGALIZATION"
        | "CONSULAR_CARD"
        | "ATTESTATION"
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
    Enums: {
      app_role: ["super_admin", "admin", "agent", "citizen"],
      appointment_status: [
        "SCHEDULED",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      gender: ["male", "female"],
      notification_channel: ["app", "email", "sms"],
      notification_status: ["pending", "sent", "delivered", "failed", "read"],
      notification_type: [
        "updated",
        "reminder",
        "confirmation",
        "cancellation",
        "communication",
        "important_communication",
        "appointment_confirmation",
        "appointment_reminder",
        "appointment_cancellation",
        "consular_registration_submitted",
        "consular_registration_validated",
        "consular_registration_rejected",
        "consular_card_ready",
        "consular_registration_completed",
        "feedback",
      ],
      organization_type: [
        "CONSULAT_GENERAL",
        "CONSULAT",
        "AMBASSADE",
        "HAUT_COMMISSARIAT",
        "MISSION_PERMANENTE",
      ],
      profile_status: ["draft", "active", "inactive", "pending", "suspended"],
      request_priority: ["LOW", "NORMAL", "HIGH", "URGENT"],
      request_status: [
        "PENDING",
        "IN_PROGRESS",
        "AWAITING_DOCUMENTS",
        "VALIDATED",
        "REJECTED",
        "COMPLETED",
      ],
      request_type: [
        "PASSPORT",
        "VISA",
        "CIVIL_REGISTRY",
        "LEGALIZATION",
        "CONSULAR_CARD",
        "ATTESTATION",
      ],
    },
  },
} as const
