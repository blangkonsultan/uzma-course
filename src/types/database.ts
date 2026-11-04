
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "branch_shifts": {
                  Row: {
                    "branch_id": string,"created_at": string,"end_time": string,"id": string,"is_active": boolean,"name": string,"start_time": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "branch_id": string,"created_at"?: string,"end_time": string,"id"?: string,"is_active"?: boolean,"name": string,"start_time": string,"updated_at"?: string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"end_time"?: string,"id"?: string,"is_active"?: boolean,"name"?: string,"start_time"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "branch_shifts_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    }
                  ]
                },"branches": {
                  Row: {
                    "address": string,"code": string | null,"created_at": string,"desa": string,"geofence_radius_m": number,"gmaps_url": string | null,"id": string,"is_active": boolean,"kecamatan": string,"latitude": number | null,"longitude": number | null,"map_embed_url": string | null,"name": string,"sub_name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string,"code"?: string | null,"created_at"?: string,"desa"?: string,"geofence_radius_m"?: number,"gmaps_url"?: string | null,"id": string,"is_active"?: boolean,"kecamatan"?: string,"latitude"?: number | null,"longitude"?: number | null,"map_embed_url"?: string | null,"name": string,"sub_name"?: string,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string,"code"?: string | null,"created_at"?: string,"desa"?: string,"geofence_radius_m"?: number,"gmaps_url"?: string | null,"id"?: string,"is_active"?: boolean,"kecamatan"?: string,"latitude"?: number | null,"longitude"?: number | null,"map_embed_url"?: string | null,"name"?: string,"sub_name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"landing_content": {
                  Row: {
                    "content": NonNullable<Json>,"section": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: NonNullable<Json>,"section": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "content"?: NonNullable<Json>,"section"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"payroll_adjustments": {
                  Row: {
                    "amount": number,"created_at": string,"created_by": string,"id": string,"period_id": string,"reason": string,"teacher_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"created_by": string,"id"?: string,"period_id": string,"reason": string,"teacher_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"created_by"?: string,"id"?: string,"period_id"?: string,"reason"?: string,"teacher_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payroll_adjustments_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_adjustments_period_id_fkey"
      columns: ["period_id"]
isOneToOne: false
      referencedRelation: "payroll_periods"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_adjustments_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payroll_entries": {
                  Row: {
                    "adjustments_total": number,"allowances_snapshot": NonNullable<Json>,"created_at": string,"fee_sessions_total": number,"fixed_allowances_total": number,"id": string,"minimum_income_snapshot": number,"period_id": string,"teacher_id": string,"total_amount": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "adjustments_total"?: number,"allowances_snapshot"?: NonNullable<Json>,"created_at"?: string,"fee_sessions_total"?: number,"fixed_allowances_total"?: number,"id"?: string,"minimum_income_snapshot"?: number,"period_id": string,"teacher_id": string,"total_amount"?: number,"updated_at"?: string
                  }
                  Update: {
                    "adjustments_total"?: number,"allowances_snapshot"?: NonNullable<Json>,"created_at"?: string,"fee_sessions_total"?: number,"fixed_allowances_total"?: number,"id"?: string,"minimum_income_snapshot"?: number,"period_id"?: string,"teacher_id"?: string,"total_amount"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payroll_entries_period_id_fkey"
      columns: ["period_id"]
isOneToOne: false
      referencedRelation: "payroll_periods"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_entries_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payroll_periods": {
                  Row: {
                    "closed_at": string | null,"closed_by": string | null,"created_at": string,"id": string,"paid_at": string | null,"paid_by": string | null,"period_month": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "closed_at"?: string | null,"closed_by"?: string | null,"created_at"?: string,"id"?: string,"paid_at"?: string | null,"paid_by"?: string | null,"period_month": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "closed_at"?: string | null,"closed_by"?: string | null,"created_at"?: string,"id"?: string,"paid_at"?: string | null,"paid_by"?: string | null,"period_month"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payroll_periods_closed_by_fkey"
      columns: ["closed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_periods_paid_by_fkey"
      columns: ["paid_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payroll_session_lines": {
                  Row: {
                    "attendance_status": string,"created_at": string,"id": string,"payable_amount": number,"period_id": string,"session_date": string,"student_id": string,"teacher_fee_snapshot": number,"teacher_id": string,"teaching_session_id": string,"teaching_session_student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attendance_status": string,"created_at"?: string,"id"?: string,"payable_amount": number,"period_id": string,"session_date": string,"student_id": string,"teacher_fee_snapshot": number,"teacher_id": string,"teaching_session_id": string,"teaching_session_student_id": string
                  }
                  Update: {
                    "attendance_status"?: string,"created_at"?: string,"id"?: string,"payable_amount"?: number,"period_id"?: string,"session_date"?: string,"student_id"?: string,"teacher_fee_snapshot"?: number,"teacher_id"?: string,"teaching_session_id"?: string,"teaching_session_student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payroll_session_lines_period_id_fkey"
      columns: ["period_id"]
isOneToOne: false
      referencedRelation: "payroll_periods"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_session_lines_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_session_lines_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_session_lines_teaching_session_id_fkey"
      columns: ["teaching_session_id"]
isOneToOne: false
      referencedRelation: "teaching_sessions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payroll_session_lines_teaching_session_student_id_fkey"
      columns: ["teaching_session_student_id"]
isOneToOne: true
      referencedRelation: "teaching_session_students"
      referencedColumns: ["id"]
    }
                  ]
                },"profile_branches": {
                  Row: {
                    "branch_id": string,"created_at": string,"is_primary": boolean,"profile_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "branch_id": string,"created_at"?: string,"is_primary"?: boolean,"profile_id": string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"is_primary"?: boolean,"profile_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profile_branches_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "profile_branches_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profile_programs": {
                  Row: {
                    "created_at": string,"profile_id": string,"program_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"profile_id": string,"program_id": string
                  }
                  Update: {
                    "created_at"?: string,"profile_id"?: string,"program_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profile_programs_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "profile_programs_program_id_fkey"
      columns: ["program_id"]
isOneToOne: false
      referencedRelation: "programs"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "allowances": NonNullable<Json>,"bank_account_holder": string | null,"bank_account_number": string | null,"bank_name": string | null,"birth_date": string | null,"branch_id": string | null,"created_at": string,"full_name": string,"id": string,"is_active": boolean,"minimum_income": number | null,"phone": string | null,"role": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "allowances"?: NonNullable<Json>,"bank_account_holder"?: string | null,"bank_account_number"?: string | null,"bank_name"?: string | null,"birth_date"?: string | null,"branch_id"?: string | null,"created_at"?: string,"full_name": string,"id": string,"is_active"?: boolean,"minimum_income"?: number | null,"phone"?: string | null,"role"?: string,"updated_at"?: string
                  }
                  Update: {
                    "allowances"?: NonNullable<Json>,"bank_account_holder"?: string | null,"bank_account_number"?: string | null,"bank_name"?: string | null,"birth_date"?: string | null,"branch_id"?: string | null,"created_at"?: string,"full_name"?: string,"id"?: string,"is_active"?: boolean,"minimum_income"?: number | null,"phone"?: string | null,"role"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    }
                  ]
                },"program_variants": {
                  Row: {
                    "created_at": string,"default_spp": number,"duration": number,"frequency": number,"id": string,"is_active": boolean,"name": string,"program_id": string,"show_on_landing": boolean,"sort_order": number,"system": number,"teacher_fee": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"default_spp"?: number,"duration"?: number,"frequency"?: number,"id"?: string,"is_active"?: boolean,"name": string,"program_id": string,"show_on_landing"?: boolean,"sort_order"?: number,"system"?: number,"teacher_fee"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"default_spp"?: number,"duration"?: number,"frequency"?: number,"id"?: string,"is_active"?: boolean,"name"?: string,"program_id"?: string,"show_on_landing"?: boolean,"sort_order"?: number,"system"?: number,"teacher_fee"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "program_variants_program_id_fkey"
      columns: ["program_id"]
isOneToOne: false
      referencedRelation: "programs"
      referencedColumns: ["id"]
    }
                  ]
                },"programs": {
                  Row: {
                    "age_range": string,"created_at": string,"description": string,"duration": number,"features": (string)[],"icon": string,"id": string,"initials": string,"is_active": boolean,"license_description": string | null,"license_provider": string | null,"license_url": string | null,"logo_url": string | null,"name": string,"sort_order": number,"system": number,"tagline": string,"type": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "age_range"?: string,"created_at"?: string,"description"?: string,"duration"?: number,"features"?: (string)[],"icon"?: string,"id"?: string,"initials": string,"is_active"?: boolean,"license_description"?: string | null,"license_provider"?: string | null,"license_url"?: string | null,"logo_url"?: string | null,"name": string,"sort_order"?: number,"system"?: number,"tagline"?: string,"type"?: string,"updated_at"?: string
                  }
                  Update: {
                    "age_range"?: string,"created_at"?: string,"description"?: string,"duration"?: number,"features"?: (string)[],"icon"?: string,"id"?: string,"initials"?: string,"is_active"?: boolean,"license_description"?: string | null,"license_provider"?: string | null,"license_url"?: string | null,"logo_url"?: string | null,"name"?: string,"sort_order"?: number,"system"?: number,"tagline"?: string,"type"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"schedule_classes": {
                  Row: {
                    "created_at": string,"day_of_week": number,"draft_id": string,"end_time": string,"id": string,"shift_id": string,"start_time": string,"teacher_id": string,"updated_at": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"day_of_week": number,"draft_id": string,"end_time": string,"id"?: string,"shift_id": string,"start_time": string,"teacher_id": string,"updated_at"?: string,"variant_id": string
                  }
                  Update: {
                    "created_at"?: string,"day_of_week"?: number,"draft_id"?: string,"end_time"?: string,"id"?: string,"shift_id"?: string,"start_time"?: string,"teacher_id"?: string,"updated_at"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "schedule_classes_draft_id_fkey"
      columns: ["draft_id"]
isOneToOne: false
      referencedRelation: "schedule_drafts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "schedule_classes_shift_id_fkey"
      columns: ["shift_id"]
isOneToOne: false
      referencedRelation: "branch_shifts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "schedule_classes_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "schedule_classes_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "program_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"schedule_drafts": {
                  Row: {
                    "branch_id": string,"created_at": string,"effective_date": string | null,"id": string,"name": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "branch_id": string,"created_at"?: string,"effective_date"?: string | null,"id"?: string,"name": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"effective_date"?: string | null,"id"?: string,"name"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "schedule_drafts_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    }
                  ]
                },"schedule_placements": {
                  Row: {
                    "class_id": string,"created_at": string,"id": string,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id": string,"created_at"?: string,"id"?: string,"student_id": string
                  }
                  Update: {
                    "class_id"?: string,"created_at"?: string,"id"?: string,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "schedule_placements_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "schedule_classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "schedule_placements_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"student_invoices": {
                  Row: {
                    "amount": number,"branch_id": string,"created_at": string,"created_by": string | null,"cycle_number": number,"discount_amount": number,"due_date": string,"id": string,"invoice_number": string,"notes": string | null,"period_end": string,"period_start": string,"program_id": string,"status": string,"student_id": string,"total_amount": number,"updated_at": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"branch_id": string,"created_at"?: string,"created_by"?: string | null,"cycle_number"?: number,"discount_amount"?: number,"due_date": string,"id"?: string,"invoice_number": string,"notes"?: string | null,"period_end": string,"period_start": string,"program_id": string,"status"?: string,"student_id": string,"total_amount": number,"updated_at"?: string,"variant_id": string
                  }
                  Update: {
                    "amount"?: number,"branch_id"?: string,"created_at"?: string,"created_by"?: string | null,"cycle_number"?: number,"discount_amount"?: number,"due_date"?: string,"id"?: string,"invoice_number"?: string,"notes"?: string | null,"period_end"?: string,"period_start"?: string,"program_id"?: string,"status"?: string,"student_id"?: string,"total_amount"?: number,"updated_at"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_invoices_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_invoices_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_invoices_program_id_fkey"
      columns: ["program_id"]
isOneToOne: false
      referencedRelation: "programs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_invoices_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_invoices_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "program_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"student_payments": {
                  Row: {
                    "amount_paid": number,"created_at": string,"id": string,"invoice_id": string,"notes": string | null,"payment_date": string,"payment_method": string,"payment_reference": string | null,"receipt_number": string,"received_by": string | null,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_paid": number,"created_at"?: string,"id"?: string,"invoice_id": string,"notes"?: string | null,"payment_date"?: string,"payment_method": string,"payment_reference"?: string | null,"receipt_number": string,"received_by"?: string | null,"student_id": string
                  }
                  Update: {
                    "amount_paid"?: number,"created_at"?: string,"id"?: string,"invoice_id"?: string,"notes"?: string | null,"payment_date"?: string,"payment_method"?: string,"payment_reference"?: string | null,"receipt_number"?: string,"received_by"?: string | null,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_payments_invoice_id_fkey"
      columns: ["invoice_id"]
isOneToOne: true
      referencedRelation: "student_invoices"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_payments_received_by_fkey"
      columns: ["received_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_payments_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"student_programs": {
                  Row: {
                    "created_at": string,"cycle_days": number,"cycle_start_date": string,"enrolled_at": string,"on_time_discount_type": string | null,"on_time_discount_value": number,"program_id": string,"spp_amount": number,"status": string,"student_id": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"cycle_days"?: number,"cycle_start_date"?: string,"enrolled_at"?: string,"on_time_discount_type"?: string | null,"on_time_discount_value"?: number,"program_id": string,"spp_amount"?: number,"status"?: string,"student_id": string,"variant_id": string
                  }
                  Update: {
                    "created_at"?: string,"cycle_days"?: number,"cycle_start_date"?: string,"enrolled_at"?: string,"on_time_discount_type"?: string | null,"on_time_discount_value"?: number,"program_id"?: string,"spp_amount"?: number,"status"?: string,"student_id"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_programs_program_id_fkey"
      columns: ["program_id"]
isOneToOne: false
      referencedRelation: "programs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_programs_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_programs_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "program_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"students": {
                  Row: {
                    "address": string | null,"birth_date": string | null,"branch_id": string,"created_at": string,"full_name": string,"id": string,"is_active": boolean,"joined_date": string | null,"notes": string | null,"parent_email": string | null,"parent_name": string,"parent_phone": string,"student_number": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"birth_date"?: string | null,"branch_id": string,"created_at"?: string,"full_name": string,"id"?: string,"is_active"?: boolean,"joined_date"?: string | null,"notes"?: string | null,"parent_email"?: string | null,"parent_name": string,"parent_phone": string,"student_number"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"birth_date"?: string | null,"branch_id"?: string,"created_at"?: string,"full_name"?: string,"id"?: string,"is_active"?: boolean,"joined_date"?: string | null,"notes"?: string | null,"parent_email"?: string | null,"parent_name"?: string,"parent_phone"?: string,"student_number"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "students_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    }
                  ]
                },"teacher_attendances": {
                  Row: {
                    "branch_id": string,"check_in_lat": number | null,"check_in_lng": number | null,"check_in_time": string,"check_out_lat": number | null,"check_out_lng": number | null,"check_out_time": string | null,"created_at": string,"id": string,"notes": string | null,"shift_id": string | null,"teacher_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "branch_id": string,"check_in_lat"?: number | null,"check_in_lng"?: number | null,"check_in_time": string,"check_out_lat"?: number | null,"check_out_lng"?: number | null,"check_out_time"?: string | null,"created_at"?: string,"id"?: string,"notes"?: string | null,"shift_id"?: string | null,"teacher_id": string
                  }
                  Update: {
                    "branch_id"?: string,"check_in_lat"?: number | null,"check_in_lng"?: number | null,"check_in_time"?: string,"check_out_lat"?: number | null,"check_out_lng"?: number | null,"check_out_time"?: string | null,"created_at"?: string,"id"?: string,"notes"?: string | null,"shift_id"?: string | null,"teacher_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "teacher_attendances_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teacher_attendances_shift_id_fkey"
      columns: ["shift_id"]
isOneToOne: false
      referencedRelation: "branch_shifts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teacher_attendances_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"teaching_session_students": {
                  Row: {
                    "achievement": string | null,"attendance_status": string | null,"created_at": string,"id": string,"session_id": string,"student_id": string,"teacher_fee_snapshot": number,"teacher_note": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achievement"?: string | null,"attendance_status"?: string | null,"created_at"?: string,"id"?: string,"session_id": string,"student_id": string,"teacher_fee_snapshot": number,"teacher_note"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "achievement"?: string | null,"attendance_status"?: string | null,"created_at"?: string,"id"?: string,"session_id"?: string,"student_id"?: string,"teacher_fee_snapshot"?: number,"teacher_note"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "teaching_session_students_session_id_fkey"
      columns: ["session_id"]
isOneToOne: false
      referencedRelation: "teaching_sessions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teaching_session_students_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id"]
    }
                  ]
                },"teaching_sessions": {
                  Row: {
                    "branch_id": string,"created_at": string,"id": string,"schedule_class_id": string,"scheduled_end_time": string,"scheduled_start_time": string,"session_date": string,"shift_id": string,"status": string,"submitted_at": string | null,"teacher_id": string,"updated_at": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "branch_id": string,"created_at"?: string,"id"?: string,"schedule_class_id": string,"scheduled_end_time": string,"scheduled_start_time": string,"session_date": string,"shift_id": string,"status"?: string,"submitted_at"?: string | null,"teacher_id": string,"updated_at"?: string,"variant_id": string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"id"?: string,"schedule_class_id"?: string,"scheduled_end_time"?: string,"scheduled_start_time"?: string,"session_date"?: string,"shift_id"?: string,"status"?: string,"submitted_at"?: string | null,"teacher_id"?: string,"updated_at"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "teaching_sessions_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teaching_sessions_schedule_class_id_fkey"
      columns: ["schedule_class_id"]
isOneToOne: false
      referencedRelation: "schedule_classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teaching_sessions_shift_id_fkey"
      columns: ["shift_id"]
isOneToOne: false
      referencedRelation: "branch_shifts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teaching_sessions_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teaching_sessions_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "program_variants"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "add_payroll_adjustment":
{ Args: { "p_amount": number,"p_period_id": string,"p_reason": string,"p_teacher_id": string }; Returns: {
              "amount": number,
"created_at": string,
"created_by": string,
"id": string,
"period_id": string,
"reason": string,
"teacher_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "payroll_adjustments"
        isOneToOne: true
        isSetofReturn: false
      } },
"close_payroll_period":
{ Args: { "p_period_id": string }; Returns: {
              "closed_at": string | null,
"closed_by": string | null,
"created_at": string,
"id": string,
"paid_at": string | null,
"paid_by": string | null,
"period_month": string,
"status": string,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "payroll_periods"
        isOneToOne: true
        isSetofReturn: false
      } },
"generate_due_student_invoices":
{ Args: { "p_branch_id"?: string }; Returns: {
              "amount": number,
"branch_id": string,
"created_at": string,
"created_by": string | null,
"cycle_number": number,
"discount_amount": number,
"due_date": string,
"id": string,
"invoice_number": string,
"notes": string | null,
"period_end": string,
"period_start": string,
"program_id": string,
"status": string,
"student_id": string,
"total_amount": number,
"updated_at": string,
"variant_id": string
            }[]
                          SetofOptions: {
        from: "*"
        to: "student_invoices"
        isOneToOne: false
        isSetofReturn: true
      } },
"get_teacher_class_students":
{ Args: { "p_class_ids": (string)[] }; Returns: {
              "class_id": string,"full_name": string,"student_id": string,"student_number": string
            }[]
                           },
"get_teacher_overdue_spp":
{ Args: { "p_class_ids": (string)[] }; Returns: {
              "class_id": string,"due_date": string,"invoice_count": number,"program_id": string,"student_id": string,"total_amount": number
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"mark_payroll_period_paid":
{ Args: { "p_period_id": string }; Returns: {
              "closed_at": string | null,
"closed_by": string | null,
"created_at": string,
"id": string,
"paid_at": string | null,
"paid_by": string | null,
"period_month": string,
"status": string,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "payroll_periods"
        isOneToOne: true
        isSetofReturn: false
      } },
"record_student_payment":
{ Args: { "p_invoice_id": string,"p_notes"?: string,"p_payment_date"?: string,"p_payment_method": string,"p_payment_reference"?: string }; Returns: {
              "amount_paid": number,
"created_at": string,
"id": string,
"invoice_id": string,
"notes": string | null,
"payment_date": string,
"payment_method": string,
"payment_reference": string | null,
"receipt_number": string,
"received_by": string | null,
"student_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "student_payments"
        isOneToOne: true
        isSetofReturn: false
      } },
"save_teaching_session":
{ Args: { "p_schedule_class_id": string,"p_session_date": string,"p_students": Json }; Returns: {
              "branch_id": string,
"created_at": string,
"id": string,
"schedule_class_id": string,
"scheduled_end_time": string,
"scheduled_start_time": string,
"session_date": string,
"shift_id": string,
"status": string,
"submitted_at": string | null,
"teacher_id": string,
"updated_at": string,
"variant_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "teaching_sessions"
        isOneToOne: true
        isSetofReturn: false
      } },
"submit_teaching_session":
{ Args: { "p_session_id": string }; Returns: {
              "branch_id": string,
"created_at": string,
"id": string,
"schedule_class_id": string,
"scheduled_end_time": string,
"scheduled_start_time": string,
"session_date": string,
"shift_id": string,
"status": string,
"submitted_at": string | null,
"teacher_id": string,
"updated_at": string,
"variant_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "teaching_sessions"
        isOneToOne: true
        isSetofReturn: false
      } }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
