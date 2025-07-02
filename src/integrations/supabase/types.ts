export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          preferred_contact_method: string | null
          primary_address: string
          rating: number | null
          secondary_address: string | null
          total_jobs_completed: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          preferred_contact_method?: string | null
          primary_address: string
          rating?: number | null
          secondary_address?: string | null
          total_jobs_completed?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          preferred_contact_method?: string | null
          primary_address?: string
          rating?: number | null
          secondary_address?: string | null
          total_jobs_completed?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          address: string | null
          availability: string | null
          created_at: string
          email: string | null
          expected_hourly_wage: number | null
          experience_years: number | null
          id: string
          interview_date: string | null
          interview_notes: string | null
          name: string
          notes: string | null
          phone: string
          position_applied: string | null
          reference_contacts: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          address?: string | null
          availability?: string | null
          created_at?: string
          email?: string | null
          expected_hourly_wage?: number | null
          experience_years?: number | null
          id?: string
          interview_date?: string | null
          interview_notes?: string | null
          name: string
          notes?: string | null
          phone: string
          position_applied?: string | null
          reference_contacts?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          availability?: string | null
          created_at?: string
          email?: string | null
          expected_hourly_wage?: number | null
          experience_years?: number | null
          id?: string
          interview_date?: string | null
          interview_notes?: string | null
          name?: string
          notes?: string | null
          phone?: string
          position_applied?: string | null
          reference_contacts?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          created_at: string
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string
          hire_date: string
          hourly_wage: number
          id: string
          name: string
          notes: string | null
          overtime_rate: number | null
          phone: string
          position: string | null
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string
          hire_date?: string
          hourly_wage: number
          id?: string
          name: string
          notes?: string | null
          overtime_rate?: number | null
          phone: string
          position?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string
          hire_date?: string
          hourly_wage?: number
          id?: string
          name?: string
          notes?: string | null
          overtime_rate?: number | null
          phone?: string
          position?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
        }
        Relationships: []
      }
      job_assignments: {
        Row: {
          created_at: string
          employee_id: string
          hourly_rate: number
          id: string
          job_id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          hourly_rate: number
          id?: string
          job_id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          hourly_rate?: number
          id?: string
          job_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_duration_hours: number | null
          actual_total: number | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string
          completion_notes: string | null
          created_at: string
          customer_satisfaction: number | null
          destination_address: string
          estimated_duration_hours: number
          estimated_total: number
          hourly_rate: number
          id: string
          invoice_number: string | null
          is_paid: boolean
          job_date: string
          job_number: string
          movers_needed: number
          origin_address: string
          paid_at: string | null
          payment_due_date: string | null
          payment_method: string | null
          special_requirements: string | null
          start_time: string
          status: Database["public"]["Enums"]["job_status"]
          tax_amount: number | null
          truck_gas_cost: number | null
          truck_rental_cost: number | null
          truck_service_fee: number | null
          truck_size: string | null
          updated_at: string
        }
        Insert: {
          actual_duration_hours?: number | null
          actual_total?: number | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone: string
          completion_notes?: string | null
          created_at?: string
          customer_satisfaction?: number | null
          destination_address: string
          estimated_duration_hours: number
          estimated_total: number
          hourly_rate: number
          id?: string
          invoice_number?: string | null
          is_paid?: boolean
          job_date: string
          job_number?: string
          movers_needed?: number
          origin_address: string
          paid_at?: string | null
          payment_due_date?: string | null
          payment_method?: string | null
          special_requirements?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["job_status"]
          tax_amount?: number | null
          truck_gas_cost?: number | null
          truck_rental_cost?: number | null
          truck_service_fee?: number | null
          truck_size?: string | null
          updated_at?: string
        }
        Update: {
          actual_duration_hours?: number | null
          actual_total?: number | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string
          completion_notes?: string | null
          created_at?: string
          customer_satisfaction?: number | null
          destination_address?: string
          estimated_duration_hours?: number
          estimated_total?: number
          hourly_rate?: number
          id?: string
          invoice_number?: string | null
          is_paid?: boolean
          job_date?: string
          job_number?: string
          movers_needed?: number
          origin_address?: string
          paid_at?: string | null
          payment_due_date?: string | null
          payment_method?: string | null
          special_requirements?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["job_status"]
          tax_amount?: number | null
          truck_gas_cost?: number | null
          truck_rental_cost?: number | null
          truck_service_fee?: number | null
          truck_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          follow_up_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          follow_up_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          follow_up_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          pin: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          pin: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          pin?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_duration_minutes: number | null
          clock_in_time: string
          clock_out_time: string | null
          created_at: string
          employee_id: string
          entry_date: string
          hourly_rate: number
          id: string
          is_paid: boolean
          job_id: string | null
          manager_notes: string | null
          notes: string | null
          overtime_hours: number | null
          overtime_rate: number | null
          paid_at: string | null
          regular_hours: number | null
          status: Database["public"]["Enums"]["time_entry_status"]
          total_pay: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_duration_minutes?: number | null
          clock_in_time: string
          clock_out_time?: string | null
          created_at?: string
          employee_id: string
          entry_date?: string
          hourly_rate: number
          id?: string
          is_paid?: boolean
          job_id?: string | null
          manager_notes?: string | null
          notes?: string | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          paid_at?: string | null
          regular_hours?: number | null
          status?: Database["public"]["Enums"]["time_entry_status"]
          total_pay?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_duration_minutes?: number | null
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string
          employee_id?: string
          entry_date?: string
          hourly_rate?: number
          id?: string
          is_paid?: boolean
          job_id?: string | null
          manager_notes?: string | null
          notes?: string | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          paid_at?: string | null
          regular_hours?: number | null
          status?: Database["public"]["Enums"]["time_entry_status"]
          total_pay?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          employee_id: string | null
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          employee_id?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          employee_id?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_employee_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_job_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "employee"
      employee_status: "active" | "inactive" | "terminated" | "on_leave"
      job_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
      lead_source:
        | "website"
        | "referral"
        | "google_ads"
        | "facebook"
        | "phone"
        | "walk_in"
        | "other"
      lead_status: "new" | "contacted" | "quoted" | "converted" | "lost"
      time_entry_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "manager", "employee"],
      employee_status: ["active", "inactive", "terminated", "on_leave"],
      job_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      lead_source: [
        "website",
        "referral",
        "google_ads",
        "facebook",
        "phone",
        "walk_in",
        "other",
      ],
      lead_status: ["new", "contacted", "quoted", "converted", "lost"],
      time_entry_status: ["pending", "approved", "rejected"],
    },
  },
} as const
