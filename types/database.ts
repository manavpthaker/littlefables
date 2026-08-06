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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_slug: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          badge_slug: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          badge_slug?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      book_progress: {
        Row: {
          book_id: string
          chapter_idx: number
          child_id: string
          page_idx: number
          updated_at: string
        }
        Insert: {
          book_id: string
          chapter_idx?: number
          child_id: string
          page_idx?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          chapter_idx?: number
          child_id?: string
          page_idx?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      book_shares: {
        Row: {
          book_id: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          household_id: string
          id: string
          password_hash: string | null
          revoked_at: string | null
          token_hash: string
          view_count: number
        }
        Insert: {
          book_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          household_id: string
          id?: string
          password_hash?: string | null
          revoked_at?: string | null
          token_hash: string
          view_count?: number
        }
        Update: {
          book_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          household_id?: string
          id?: string
          password_hash?: string | null
          revoked_at?: string | null
          token_hash?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_shares_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_shares_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          book: Json
          by_line: string | null
          child_id: string | null
          cover_bg: string | null
          cover_emoji: string | null
          created_at: string
          household_id: string
          id: string
          kind: string
          origin_note: string | null
          shelf_enabled: boolean
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          book: Json
          by_line?: string | null
          child_id?: string | null
          cover_bg?: string | null
          cover_emoji?: string | null
          created_at?: string
          household_id: string
          id: string
          kind: string
          origin_note?: string | null
          shelf_enabled?: boolean
          source: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          book?: Json
          by_line?: string | null
          child_id?: string | null
          cover_bg?: string | null
          cover_emoji?: string | null
          created_at?: string
          household_id?: string
          id?: string
          kind?: string
          origin_note?: string | null
          shelf_enabled?: boolean
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      child_devices: {
        Row: {
          child_id: string
          created_at: string
          device_label: string | null
          expires_at: string
          household_id: string
          id: string
          last_seen_at: string | null
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          child_id: string
          created_at?: string
          device_label?: string | null
          expires_at: string
          household_id: string
          id?: string
          last_seen_at?: string | null
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          child_id?: string
          created_at?: string
          device_label?: string | null
          expires_at?: string
          household_id?: string
          id?: string
          last_seen_at?: string | null
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_devices_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          band: string
          created_at: string
          display_name: string
          exclude_terms: Json
          household_id: string
          id: string
          pronouns: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          band?: string
          created_at?: string
          display_name: string
          exclude_terms?: Json
          household_id: string
          id?: string
          pronouns?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          band?: string
          created_at?: string
          display_name?: string
          exclude_terms?: Json
          household_id?: string
          id?: string
          pronouns?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_codes: {
        Row: {
          book_slug: string
          child_id: string
          code: string
          created_at: string
          expires_at: string | null
          gift_from: string | null
          household_id: string
          id: string
          redeemed_at: string | null
          redeemed_device_id: string | null
          revoked_at: string | null
        }
        Insert: {
          book_slug: string
          child_id: string
          code: string
          created_at?: string
          expires_at?: string | null
          gift_from?: string | null
          household_id: string
          id?: string
          redeemed_at?: string | null
          redeemed_device_id?: string | null
          revoked_at?: string | null
        }
        Update: {
          book_slug?: string
          child_id?: string
          code?: string
          created_at?: string
          expires_at?: string | null
          gift_from?: string | null
          household_id?: string
          id?: string
          redeemed_at?: string | null
          redeemed_device_id?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_codes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_codes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_codes_redeemed_device_id_fkey"
            columns: ["redeemed_device_id"]
            isOneToOne: false
            referencedRelation: "child_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      intakes: {
        Row: {
          age_band: string | null
          age_years: number | null
          buyer_email: string
          buyer_name: string | null
          child_name: string
          created_at: string
          etsy_order: string | null
          gift_from: string | null
          household_id: string | null
          id: string
          inspirations: string | null
          interests: string[]
          interests_note: string | null
          look: string | null
          notes: string | null
          photo_path: string | null
          status: string
          token: string | null
          traits: string[]
          traits_note: string | null
          updated_at: string
        }
        Insert: {
          age_band?: string | null
          age_years?: number | null
          buyer_email: string
          buyer_name?: string | null
          child_name: string
          created_at?: string
          etsy_order?: string | null
          gift_from?: string | null
          household_id?: string | null
          id?: string
          inspirations?: string | null
          interests?: string[]
          interests_note?: string | null
          look?: string | null
          notes?: string | null
          photo_path?: string | null
          status?: string
          token?: string | null
          traits?: string[]
          traits_note?: string | null
          updated_at?: string
        }
        Update: {
          age_band?: string | null
          age_years?: number | null
          buyer_email?: string
          buyer_name?: string | null
          child_name?: string
          created_at?: string
          etsy_order?: string | null
          gift_from?: string | null
          household_id?: string | null
          id?: string
          inspirations?: string | null
          interests?: string[]
          interests_note?: string | null
          look?: string | null
          notes?: string | null
          photo_path?: string | null
          status?: string
          token?: string | null
          traits?: string[]
          traits_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intakes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          auth_user_id: string | null
          created_at: string
          display_name: string | null
          email: string
          household_id: string
          id: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          household_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          household_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      retells: {
        Row: {
          audio_path: string
          book_id: string | null
          book_title: string | null
          child_id: string
          created_at: string
          duration_ms: number | null
          id: string
          mime_type: string | null
          transcript: string | null
        }
        Insert: {
          audio_path: string
          book_id?: string | null
          book_title?: string | null
          child_id: string
          created_at?: string
          duration_ms?: number | null
          id: string
          mime_type?: string | null
          transcript?: string | null
        }
        Update: {
          audio_path?: string
          book_id?: string | null
          book_title?: string | null
          child_id?: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          mime_type?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retells_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retells_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          count: number
          day: string
          household_id: string
          kind: string
          updated_at: string
        }
        Insert: {
          count?: number
          day: string
          household_id: string
          kind: string
          updated_at?: string
        }
        Update: {
          count?: number
          day?: string
          household_id?: string
          kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_parent_household_id: { Args: never; Returns: string }
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
