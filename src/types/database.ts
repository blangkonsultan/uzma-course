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
      branches: {
        Row: {
          id: string;
          name: string;
          sub_name: string;
          address: string;
          latitude: number | null;
          longitude: number | null;
          geofence_radius_m: number;
          map_embed_url: string | null;
          gmaps_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          sub_name?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          geofence_radius_m?: number;
          map_embed_url?: string | null;
          gmaps_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sub_name?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          geofence_radius_m?: number;
          map_embed_url?: string | null;
          gmaps_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          initials: string;
          name: string;
          tagline: string;
          description: string;
          age_range: string;
          icon: string;
          type: "franchise" | "original";
          logo_url: string | null;
          license_provider: string | null;
          license_url: string | null;
          license_description: string | null;
          system: string;
          duration: number;
          frequency: string;
          features: string[];
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          initials: string;
          name: string;
          tagline?: string;
          description?: string;
          age_range?: string;
          icon?: string;
          type?: "franchise" | "original";
          logo_url?: string | null;
          license_provider?: string | null;
          license_url?: string | null;
          license_description?: string | null;
          system?: string;
          duration?: number;
          frequency?: string;
          features?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          initials?: string;
          name?: string;
          tagline?: string;
          description?: string;
          age_range?: string;
          icon?: string;
          type?: "franchise" | "original";
          logo_url?: string | null;
          license_provider?: string | null;
          license_url?: string | null;
          license_description?: string | null;
          system?: string;
          duration?: number;
          frequency?: string;
          features?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: "admin" | "guru";
          branch_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: "admin" | "guru";
          branch_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: "admin" | "guru";
          branch_id?: string | null;
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
          },
          {
            foreignKeyName: "profiles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
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
          branch_id: string;
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
          branch_id: string;
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
          branch_id?: string;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          }
        ];
      };
      student_programs: {
        Row: {
          student_id: string;
          program_id: string;
          spp_amount: number;
          enrolled_at: string;
          status: "active" | "cuti" | "lulus" | "keluar";
          created_at: string;
        };
        Insert: {
          student_id: string;
          program_id: string;
          spp_amount?: number;
          enrolled_at?: string;
          status?: "active" | "cuti" | "lulus" | "keluar";
          created_at?: string;
        };
        Update: {
          student_id?: string;
          program_id?: string;
          spp_amount?: number;
          enrolled_at?: string;
          status?: "active" | "cuti" | "lulus" | "keluar";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_programs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_programs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      profile_programs: {
        Row: {
          profile_id: string;
          program_id: string;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          program_id: string;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          program_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_programs_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_programs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
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
