export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      branch_shifts: {
        Row: {
          branch_id: string;
          created_at: string;
          day_of_week: number;
          end_time: string;
          id: string;
          is_active: boolean;
          name: string;
          start_time: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          day_of_week: number;
          end_time: string;
          id?: string;
          is_active?: boolean;
          name: string;
          start_time: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          day_of_week?: number;
          end_time?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          start_time?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branch_shifts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      branches: {
        Row: {
          address: string;
          code: string | null;
          created_at: string;
          geofence_radius_m: number;
          gmaps_url: string | null;
          id: string;
          is_active: boolean;
          latitude: number | null;
          longitude: number | null;
          map_embed_url: string | null;
          name: string;
          sub_name: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          code?: string | null;
          created_at?: string;
          geofence_radius_m?: number;
          gmaps_url?: string | null;
          id: string;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          map_embed_url?: string | null;
          name: string;
          sub_name?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          code?: string | null;
          created_at?: string;
          geofence_radius_m?: number;
          gmaps_url?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          map_embed_url?: string | null;
          name?: string;
          sub_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      landing_content: {
        Row: {
          content: NonNullable<Json>;
          section: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          content?: NonNullable<Json>;
          section: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          content?: NonNullable<Json>;
          section?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      profile_programs: {
        Row: {
          created_at: string;
          profile_id: string;
          program_id: string;
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          program_id: string;
        };
        Update: {
          created_at?: string;
          profile_id?: string;
          program_id?: string;
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
          },
        ];
      };
      profiles: {
        Row: {
                                                  bank_account_holder: string | null;
          bank_account_number: string | null;
          bank_name: string | null;
          birth_date: string | null;
          branch_id: string | null;
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          allowances: Json;
          minimum_income: number | null;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
                                                  bank_account_holder?: string | null;
          bank_account_number?: string | null;
          bank_name?: string | null;
          birth_date?: string | null;
          branch_id?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          allowances?: Json;
          minimum_income?: number | null;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
                                                  bank_account_holder?: string | null;
          bank_account_number?: string | null;
          bank_name?: string | null;
          birth_date?: string | null;
          branch_id?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          allowances?: Json;
          minimum_income?: number | null;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      program_variants: {
        Row: {
          created_at: string;
          default_spp: number;
          duration: number;
          frequency: number;
          id: string;
          is_active: boolean;
          show_on_landing: boolean;
          name: string;
          program_id: string;
          sort_order: number;
          system: number;
          teacher_fee: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_spp?: number;
          duration?: number;
          frequency?: number;
          id?: string;
          is_active?: boolean;
          show_on_landing?: boolean;
          name: string;
          program_id: string;
          sort_order?: number;
          system?: number;
          teacher_fee?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_spp?: number;
          duration?: number;
          frequency?: number;
          id?: string;
          is_active?: boolean;
          show_on_landing?: boolean;
          name?: string;
          program_id?: string;
          sort_order?: number;
          system?: number;
          teacher_fee?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_variants_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      programs: {
        Row: {
          age_range: string;
          created_at: string;
          description: string;
          duration: number;
          features: string[];
          icon: string;
          id: string;
          initials: string;
          is_active: boolean;
          license_description: string | null;
          license_provider: string | null;
          license_url: string | null;
          logo_url: string | null;
          name: string;
          sort_order: number;
          system: number;
          tagline: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          age_range?: string;
          created_at?: string;
          description?: string;
          duration?: number;
          features?: string[];
          icon?: string;
          id?: string;
          initials: string;
          is_active?: boolean;
          license_description?: string | null;
          license_provider?: string | null;
          license_url?: string | null;
          logo_url?: string | null;
          name: string;
          sort_order?: number;
          system?: number;
          tagline?: string;
          type?: string;
          updated_at?: string;
        };
        Update: {
          age_range?: string;
          created_at?: string;
          description?: string;
          duration?: number;
          features?: string[];
          icon?: string;
          id?: string;
          initials?: string;
          is_active?: boolean;
          license_description?: string | null;
          license_provider?: string | null;
          license_url?: string | null;
          logo_url?: string | null;
          name?: string;
          sort_order?: number;
          system?: number;
          tagline?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_programs: {
        Row: {
          created_at: string;
          cycle_days: number;
          cycle_start_date: string;
          enrolled_at: string;
          on_time_discount_type: string | null;
          on_time_discount_value: number;
          program_id: string;
          spp_amount: number;
          status: string;
          student_id: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          cycle_days?: number;
          cycle_start_date?: string;
          enrolled_at?: string;
          on_time_discount_type?: string | null;
          on_time_discount_value?: number;
          program_id: string;
          spp_amount?: number;
          status?: string;
          student_id: string;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          cycle_days?: number;
          cycle_start_date?: string;
          enrolled_at?: string;
          on_time_discount_type?: string | null;
          on_time_discount_value?: number;
          program_id?: string;
          spp_amount?: number;
          status?: string;
          student_id?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_programs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_programs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_programs_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "program_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          address: string | null;
          student_number: string | null;
          joined_date: string | null;
          birth_date: string | null;
          branch_id: string;
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          notes: string | null;
          parent_email: string | null;
          parent_name: string;
          parent_phone: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          student_number?: string | null;
          joined_date?: string | null;
          birth_date?: string | null;
          branch_id: string;
          created_at?: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          parent_email?: string | null;
          parent_name: string;
          parent_phone: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          student_number?: string | null;
          joined_date?: string | null;
          birth_date?: string | null;
          branch_id?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          parent_email?: string | null;
          parent_name?: string;
          parent_phone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
