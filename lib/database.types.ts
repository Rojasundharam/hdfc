export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      service_approval_levels: {
        Row: {
          id: string
          service_id: string
          level: number
          staff_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          level: number
          staff_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          level?: number
          staff_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_categories: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          service_id: string
          requester_id: string
          status: string
          level: number
          max_approval_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          requester_id: string
          status?: string
          level?: number
          max_approval_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          requester_id?: string
          status?: string
          level?: number
          max_approval_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          category_id: string | null
          request_no: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          applicable_to: string
          status: string
          service_limit: number | null
          attachment_url: string | null
          sla_period: number | null
          payment_method: string
          created_at: string | null
        }
        Insert: {
          id?: string
          category_id?: string | null
          request_no: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          applicable_to: string
          status: string
          service_limit?: number | null
          attachment_url?: string | null
          sla_period?: number | null
          payment_method: string
          created_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string | null
          request_no?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          applicable_to?: string
          status?: string
          service_limit?: number | null
          attachment_url?: string | null
          sla_period?: number | null
          payment_method?: string
          created_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_service_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      assign_role: {
        Args: { user_id: string; role_id: string }
        Returns: boolean
      }
      force_delete_category: {
        Args: { category_id: string }
        Returns: void
      }
    }
    Enums: {
      service_status: 'active' | 'inactive'
      service_request_status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
    }
  }
} 