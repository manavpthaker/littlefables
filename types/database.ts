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
      art_artifacts: {
        Row: {
          approved_at: string | null
          book_id: string | null
          candidate_path: string
          chapter_idx: number | null
          character_id: string | null
          created_at: string
          household_id: string
          id: string
          kind: string
          live_url: string | null
          model: string | null
          page_idx: number | null
          prompt: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          book_id?: string | null
          candidate_path: string
          chapter_idx?: number | null
          character_id?: string | null
          created_at?: string
          household_id: string
          id?: string
          kind: string
          live_url?: string | null
          model?: string | null
          page_idx?: number | null
          prompt?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          book_id?: string | null
          candidate_path?: string
          chapter_idx?: number | null
          character_id?: string | null
          created_at?: string
          household_id?: string
          id?: string
          kind?: string
          live_url?: string | null
          model?: string | null
          page_idx?: number | null
          prompt?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_artifacts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "art_artifacts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
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
          parent_guide: string | null
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
          parent_guide?: string | null
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
          parent_guide?: string | null
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
      comprehension_records: {
        Row: {
          asked_at: string
          book_id: string | null
          chapter_idx: number | null
          child_id: string
          id: string
          judged_signal: string | null
          question: string
          question_type: string
          transcript: string | null
        }
        Insert: {
          asked_at?: string
          book_id?: string | null
          chapter_idx?: number | null
          child_id: string
          id?: string
          judged_signal?: string | null
          question: string
          question_type: string
          transcript?: string | null
        }
        Update: {
          asked_at?: string
          book_id?: string | null
          chapter_idx?: number | null
          child_id?: string
          id?: string
          judged_signal?: string | null
          question?: string
          question_type?: string
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comprehension_records_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comprehension_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
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
      qa_records: {
        Row: {
          attempt: number
          book_id: string
          canon_version: string | null
          created_at: string
          hard_gates: Json | null
          household_id: string
          id: string
          model: string | null
          soft_score: Json | null
          stage0: Json
          status: string
        }
        Insert: {
          attempt?: number
          book_id: string
          canon_version?: string | null
          created_at?: string
          hard_gates?: Json | null
          household_id: string
          id?: string
          model?: string | null
          soft_score?: Json | null
          stage0?: Json
          status: string
        }
        Update: {
          attempt?: number
          book_id?: string
          canon_version?: string | null
          created_at?: string
          hard_gates?: Json | null
          household_id?: string
          id?: string
          model?: string | null
          soft_score?: Json | null
          stage0?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_records_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_records_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_days: {
        Row: {
          child_id: string
          day: string
        }
        Insert: {
          child_id: string
          day: string
        }
        Update: {
          child_id?: string
          day?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_days_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
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
      wordbook_entries: {
        Row: {
          book_id: string | null
          child_id: string
          id: string
          meaning: string | null
          owned_at: string | null
          saved_at: string
          sentence: string | null
          word: string
        }
        Insert: {
          book_id?: string | null
          child_id: string
          id?: string
          meaning?: string | null
          owned_at?: string | null
          saved_at?: string
          sentence?: string | null
          word: string
        }
        Update: {
          book_id?: string | null
          child_id?: string
          id?: string
          meaning?: string | null
          owned_at?: string | null
          saved_at?: string
          sentence?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "wordbook_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wordbook_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      world_states: {
        Row: {
          child_id: string
          data: Json
          updated_at: string
        }
        Insert: {
          child_id: string
          data?: Json
          updated_at?: string
        }
        Update: {
          child_id?: string
          data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "world_states_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bump_usage: {
        Args: { p_household_id: string; p_kind: string }
        Returns: number
      }
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
