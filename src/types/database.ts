export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: "admin" | "guru";
          branch_id: "balongbendo" | "krian" | null;
          programs: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: "admin" | "guru";
          branch_id?: "balongbendo" | "krian" | null;
          programs?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: "admin" | "guru";
          branch_id?: "balongbendo" | "krian" | null;
          programs?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      students: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          address: string | null;
          parent_name: string;
          parent_phone: string;
          parent_email: string | null;
          branch_id: "balongbendo" | "krian";
          programs: string[];
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          address?: string | null;
          parent_name: string;
          parent_phone: string;
          parent_email?: string | null;
          branch_id: "balongbendo" | "krian";
          programs?: string[];
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          address?: string | null;
          parent_name?: string;
          parent_phone?: string;
          parent_email?: string | null;
          branch_id?: "balongbendo" | "krian";
          programs?: string[];
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      landing_content: {
        Row: {
          section: string;
          content: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          section: string;
          content?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          section?: string;
          content?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "landing_content_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
