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
      auth_sessions: {
        Row: {
          auth_level: string
          created_at: string
          failed_attempts: number
          id: string
          lockout_until: string | null
          partial_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_level?: string
          created_at?: string
          failed_attempts?: number
          id?: string
          lockout_until?: string | null
          partial_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_level?: string
          created_at?: string
          failed_attempts?: number
          id?: string
          lockout_until?: string | null
          partial_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          category: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      client_day_data: {
        Row: {
          clock_in_time: string | null
          clock_out_time: string | null
          created_at: string
          date: string
          id: string
          sleep_time: string | null
          updated_at: string
          user_id: string
          wake_time: string | null
        }
        Insert: {
          clock_in_time?: string | null
          clock_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          sleep_time?: string | null
          updated_at?: string
          user_id: string
          wake_time?: string | null
        }
        Update: {
          clock_in_time?: string | null
          clock_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          sleep_time?: string | null
          updated_at?: string
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      client_time_entries: {
        Row: {
          created_at: string
          custom_client: string | null
          date: string
          description: string
          end_time: string
          id: string
          start_time: string
          tracker_client: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_client?: string | null
          date: string
          description: string
          end_time: string
          id?: string
          start_time: string
          tracker_client: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_client?: string | null
          date?: string
          description?: string
          end_time?: string
          id?: string
          start_time?: string
          tracker_client?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          monthly_retainer: number
          name: string
          payment_method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_retainer?: number
          name: string
          payment_method?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_retainer?: number
          name?: string
          payment_method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contractors: {
        Row: {
          created_at: string
          hourly_rate: number | null
          hours_per_week: number | null
          id: string
          monthly_pay: number
          name: string
          pay_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          monthly_pay?: number
          name: string
          pay_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          monthly_pay?: number
          name?: string
          pay_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      countdowns: {
        Row: {
          created_at: string
          id: string
          target_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_date: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      day_data: {
        Row: {
          created_at: string
          date: string
          id: string
          sleep_time: string | null
          updated_at: string
          user_id: string
          wake_time: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          sleep_time?: string | null
          updated_at?: string
          user_id: string
          wake_time?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          sleep_time?: string | null
          updated_at?: string
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      debt_calculator_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          id: string
          name: string
          salary: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          salary?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          salary?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          client_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          recurring: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          client_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          recurring?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          recurring?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      life_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          notes: string | null
          payment_method: string
          reference_number: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_tax_collections: {
        Row: {
          created_at: string
          federal_income_tax: number
          federal_unemployment: number
          id: string
          medicare_employee: number
          medicare_employer: number
          notes: string | null
          payroll_check_date: string
          social_security_employee: number
          social_security_employer: number
          state_income_tax: number
          state_unemployment: number
          transaction_date: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          federal_income_tax?: number
          federal_unemployment?: number
          id?: string
          medicare_employee?: number
          medicare_employer?: number
          notes?: string | null
          payroll_check_date: string
          social_security_employee?: number
          social_security_employer?: number
          state_income_tax?: number
          state_unemployment?: number
          transaction_date: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          federal_income_tax?: number
          federal_unemployment?: number
          id?: string
          medicare_employee?: number
          medicare_employer?: number
          notes?: string | null
          payroll_check_date?: string
          social_security_employee?: number
          social_security_employer?: number
          state_income_tax?: number
          state_unemployment?: number
          transaction_date?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_deadlines: {
        Row: {
          created_at: string
          deadline_date: string
          id: string
          label: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_date: string
          id?: string
          label: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_date?: string
          id?: string
          label?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_deadlines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "plan_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_dependencies: {
        Row: {
          created_at: string
          from_task_id: string
          id: string
          to_task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_task_id: string
          id?: string
          to_task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_task_id?: string
          id?: string
          to_task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_dependencies_from_task_id_fkey"
            columns: ["from_task_id"]
            isOneToOne: false
            referencedRelation: "plan_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_dependencies_to_task_id_fkey"
            columns: ["to_task_id"]
            isOneToOne: false
            referencedRelation: "plan_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          order: number
          project_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order?: number
          project_id: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order?: number
          project_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "plan_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_projects: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_tasks: {
        Row: {
          color: string | null
          created_at: string
          end_date: string
          group_id: string | null
          id: string
          is_critical: boolean
          name: string
          project_id: string
          row_order: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          end_date: string
          group_id?: string | null
          id?: string
          is_critical?: boolean
          name: string
          project_id: string
          row_order?: number
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          end_date?: string
          group_id?: string | null
          id?: string
          is_critical?: boolean
          name?: string
          project_id?: string
          row_order?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "plan_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "plan_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prep_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_sessions: {
        Row: {
          created_at: string
          id: string
          meeting_datetime: string | null
          rich_text_content: string | null
          talking_points: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_datetime?: string | null
          rich_text_content?: string | null
          talking_points?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_datetime?: string | null
          rich_text_content?: string | null
          talking_points?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          accomplishment_1: string | null
          accomplishment_2: string | null
          accomplishment_3: string | null
          created_at: string
          date: string
          id: string
          priority_1: string | null
          priority_2: string | null
          priority_3: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accomplishment_1?: string | null
          accomplishment_2?: string | null
          accomplishment_3?: string | null
          created_at?: string
          date?: string
          id?: string
          priority_1?: string | null
          priority_2?: string | null
          priority_3?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accomplishment_1?: string | null
          accomplishment_2?: string | null
          accomplishment_3?: string | null
          created_at?: string
          date?: string
          id?: string
          priority_1?: string | null
          priority_2?: string | null
          priority_3?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_deductions: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          name: string
          reduces_federal: boolean
          reduces_fica: boolean
          reduces_state: boolean
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          name: string
          reduces_federal?: boolean
          reduces_fica?: boolean
          reduces_state?: boolean
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          name?: string
          reduces_federal?: boolean
          reduces_fica?: boolean
          reduces_state?: boolean
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          category: string
          client: string | null
          created_at: string
          custom_client: string | null
          date: string
          description: string
          end_time: string
          energy_level: string
          id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          client?: string | null
          created_at?: string
          custom_client?: string | null
          date: string
          description: string
          end_time: string
          energy_level: string
          id?: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          client?: string | null
          created_at?: string
          custom_client?: string | null
          date?: string
          description?: string
          end_time?: string
          energy_level?: string
          id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_expenses: {
        Row: {
          client_name: string | null
          created_at: string
          end_date: string
          flights: number
          ground_transport: number
          id: string
          lodging: number
          meals: number
          notes: string | null
          other_expenses: number
          per_diem: number
          purpose: string | null
          start_date: string
          trip_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          end_date: string
          flights?: number
          ground_transport?: number
          id?: string
          lodging?: number
          meals?: number
          notes?: string | null
          other_expenses?: number
          per_diem?: number
          purpose?: string | null
          start_date: string
          trip_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          end_date?: string
          flights?: number
          ground_transport?: number
          id?: string
          lodging?: number
          meals?: number
          notes?: string | null
          other_expenses?: number
          per_diem?: number
          purpose?: string | null
          start_date?: string
          trip_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
