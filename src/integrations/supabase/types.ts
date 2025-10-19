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
      blog_posts: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          excerpt: string
          hero_image_url: string | null
          id: string
          paper_ids: string[]
          publish_date: string | null
          quality_flags: Json | null
          read_time: number
          status: string | null
          subject_id: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          excerpt: string
          hero_image_url?: string | null
          id?: string
          paper_ids: string[]
          publish_date?: string | null
          quality_flags?: Json | null
          read_time: number
          status?: string | null
          subject_id?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string
          hero_image_url?: string | null
          id?: string
          paper_ids?: string[]
          publish_date?: string | null
          quality_flags?: Json | null
          read_time?: number
          status?: string | null
          subject_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_subjects: {
        Row: {
          created_at: string | null
          id: string
          journal_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          journal_id: string
          subject_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          journal_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_subjects_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          created_at: string | null
          id: string
          impact_factor: number | null
          is_interdisciplinary: boolean | null
          issn: string | null
          last_updated: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          impact_factor?: number | null
          is_interdisciplinary?: boolean | null
          issn?: string | null
          last_updated?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          impact_factor?: number | null
          is_interdisciplinary?: boolean | null
          issn?: string | null
          last_updated?: string | null
          name?: string
        }
        Relationships: []
      }
      paper_citations: {
        Row: {
          blog_post_id: string | null
          citation_order: number
          created_at: string | null
          id: string
          selected_paper_id: string | null
        }
        Insert: {
          blog_post_id?: string | null
          citation_order: number
          created_at?: string | null
          id?: string
          selected_paper_id?: string | null
        }
        Update: {
          blog_post_id?: string | null
          citation_order?: number
          created_at?: string | null
          id?: string
          selected_paper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_citations_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_citations_selected_paper_id_fkey"
            columns: ["selected_paper_id"]
            isOneToOne: false
            referencedRelation: "selected_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      selected_papers: {
        Row: {
          abstract: string
          article_title: string
          authors: string
          created_at: string | null
          doi: string
          id: string
          journal_name: string
          pdf_storage_path: string | null
          publication_date: string | null
          pubmed_id: string | null
          quality_score: number | null
          selection_date: string | null
          status: string | null
          subject_id: string | null
          week_number: number
          year: number
        }
        Insert: {
          abstract: string
          article_title: string
          authors: string
          created_at?: string | null
          doi: string
          id?: string
          journal_name: string
          pdf_storage_path?: string | null
          publication_date?: string | null
          pubmed_id?: string | null
          quality_score?: number | null
          selection_date?: string | null
          status?: string | null
          subject_id?: string | null
          week_number: number
          year: number
        }
        Update: {
          abstract?: string
          article_title?: string
          authors?: string
          created_at?: string | null
          doi?: string
          id?: string
          journal_name?: string
          pdf_storage_path?: string | null
          publication_date?: string | null
          pubmed_id?: string | null
          quality_score?: number | null
          selection_date?: string | null
          status?: string | null
          subject_id?: string | null
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "selected_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
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
