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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          category: string
          created_at: string
          created_by: string | null
          excerpt: string
          featured: boolean
          html_content: string | null
          id: string
          image_path: string | null
          published_at: string | null
          search_vector: unknown
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          featured?: boolean
          html_content?: string | null
          id?: string
          image_path?: string | null
          published_at?: string | null
          search_vector?: unknown
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          featured?: boolean
          html_content?: string | null
          id?: string
          image_path?: string | null
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      report_embeddings: {
        Row: {
          content: string
          created_at: string
          embedding: string
          id: string
          report_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding: string
          id?: string
          report_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_embeddings_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_ingestions: {
        Row: {
          ai_draft: Json
          created_at: string
          created_by: string | null
          error_message: string | null
          extracted_text: string | null
          file_name: string
          file_size: number
          id: string
          mime_type: string | null
          report_id: string | null
          status: Database["public"]["Enums"]["ingestion_status"]
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          ai_draft?: Json
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          extracted_text?: string | null
          file_name: string
          file_size?: number
          id?: string
          mime_type?: string | null
          report_id?: string | null
          status?: Database["public"]["Enums"]["ingestion_status"]
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          ai_draft?: Json
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          report_id?: string | null
          status?: Database["public"]["Enums"]["ingestion_status"]
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_ingestions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          author: string
          category: string[]
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          description: string
          download_file_path: string | null
          downloads: number
          featured: boolean
          highlight: string[]
          html_content: string | null
          id: string
          image_path: string | null
          metrics: Json
          published_at: string | null
          quote: string | null
          read_time_minutes: number | null
          search_vector: unknown
          slug: string
          source_type: Database["public"]["Enums"]["report_source_type"]
          source_url: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author?: string
          category?: string[]
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          download_file_path?: string | null
          downloads?: number
          featured?: boolean
          highlight?: string[]
          html_content?: string | null
          id?: string
          image_path?: string | null
          metrics?: Json
          published_at?: string | null
          quote?: string | null
          read_time_minutes?: number | null
          search_vector?: unknown
          slug: string
          source_type?: Database["public"]["Enums"]["report_source_type"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author?: string
          category?: string[]
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          download_file_path?: string | null
          downloads?: number
          featured?: boolean
          highlight?: string[]
          html_content?: string | null
          id?: string
          image_path?: string | null
          metrics?: Json
          published_at?: string | null
          quote?: string | null
          read_time_minutes?: number | null
          search_vector?: unknown
          slug?: string
          source_type?: Database["public"]["Enums"]["report_source_type"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      match_report_embeddings: {
        Args: {
          filter_report_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          report_id: string
          similarity: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "viewer" | "editor" | "admin"
      content_status: "draft" | "scheduled" | "published" | "archived"
      ingestion_status:
      | "uploaded"
      | "extracting"
      | "drafted"
      | "failed"
      | "completed"
      report_source_type: "upload" | "link"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["viewer", "editor", "admin"],
      content_status: ["draft", "scheduled", "published", "archived"],
      ingestion_status: [
        "uploaded",
        "extracting",
        "drafted",
        "failed",
        "completed",
      ],
      report_source_type: ["upload", "link"],
    },
  },
} as const
