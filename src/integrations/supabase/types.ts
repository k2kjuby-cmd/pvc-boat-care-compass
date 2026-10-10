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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          city: string | null
          consent: boolean
          created_at: string
          email: string | null
          id: string
          message: string
          messenger_contact: string | null
          messenger_type: string | null
          name: string
          newsletter_consent: boolean
          phone: string
          source: string
        }
        Insert: {
          city?: string | null
          consent: boolean
          created_at?: string
          email?: string | null
          id?: string
          message: string
          messenger_contact?: string | null
          messenger_type?: string | null
          name: string
          newsletter_consent?: boolean
          phone: string
          source?: string
        }
        Update: {
          city?: string | null
          consent?: boolean
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          messenger_contact?: string | null
          messenger_type?: string | null
          name?: string
          newsletter_consent?: boolean
          phone?: string
          source?: string
        }
        Relationships: []
      }
      problems: {
        Row: {
          category_slug: string | null
          icon: string
          id: string
          is_soon: boolean
          slug: string
          sort: number
          title: string
        }
        Insert: {
          category_slug?: string | null
          icon?: string
          id?: string
          is_soon?: boolean
          slug: string
          sort?: number
          title: string
        }
        Update: {
          category_slug?: string | null
          icon?: string
          id?: string
          is_soon?: boolean
          slug?: string
          sort?: number
          title?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          is_render: boolean
          kind: string
          product_id: string
          sort: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          is_render?: boolean
          kind?: string
          product_id: string
          sort?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          is_render?: boolean
          kind?: string
          product_id?: string
          sort?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lines: {
        Row: {
          color: string
          id: string
          name: string
          slug: string
          sort: number
        }
        Insert: {
          color?: string
          id?: string
          name: string
          slug: string
          sort?: number
        }
        Update: {
          color?: string
          id?: string
          name?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      product_recommendations: {
        Row: {
          product_id: string
          recommended_id: string
          sort: number
        }
        Insert: {
          product_id: string
          recommended_id: string
          sort?: number
        }
        Update: {
          product_id?: string
          recommended_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_recommended_id_fkey"
            columns: ["recommended_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          avito_url: string | null
          gross_weight_g: number | null
          id: string
          image_url: string | null
          ozon_url: string | null
          price: number | null
          product_id: string
          sku: string | null
          sold_on_site: boolean
          sort: number
          stock: number | null
          volume_ml: number | null
          weight_g: number | null
          wildberries_url: string | null
          yandex_market_url: string | null
        }
        Insert: {
          avito_url?: string | null
          gross_weight_g?: number | null
          id?: string
          image_url?: string | null
          ozon_url?: string | null
          price?: number | null
          product_id: string
          sku?: string | null
          sold_on_site?: boolean
          sort?: number
          stock?: number | null
          volume_ml?: number | null
          weight_g?: number | null
          wildberries_url?: string | null
          yandex_market_url?: string | null
        }
        Update: {
          avito_url?: string | null
          gross_weight_g?: number | null
          id?: string
          image_url?: string | null
          ozon_url?: string | null
          price?: number | null
          product_id?: string
          sku?: string | null
          sold_on_site?: boolean
          sort?: number
          stock?: number | null
          volume_ml?: number | null
          weight_g?: number | null
          wildberries_url?: string | null
          yandex_market_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          composition: string | null
          created_at: string
          cure_time: string | null
          faq: Json
          has_dilution_calc: boolean
          id: string
          is_hit: boolean
          line_id: string | null
          name: string
          purpose: string | null
          short_description: string | null
          slug: string
          sort: number
          status: Database["public"]["Enums"]["product_status"]
          suitable_for: string[]
          updated_at: string
          usage_steps: Json
          video_url: string | null
          warnings: string | null
        }
        Insert: {
          category_id?: string | null
          composition?: string | null
          created_at?: string
          cure_time?: string | null
          faq?: Json
          has_dilution_calc?: boolean
          id?: string
          is_hit?: boolean
          line_id?: string | null
          name: string
          purpose?: string | null
          short_description?: string | null
          slug: string
          sort?: number
          status?: Database["public"]["Enums"]["product_status"]
          suitable_for?: string[]
          updated_at?: string
          usage_steps?: Json
          video_url?: string | null
          warnings?: string | null
        }
        Update: {
          category_id?: string | null
          composition?: string | null
          created_at?: string
          cure_time?: string | null
          faq?: Json
          has_dilution_calc?: boolean
          id?: string
          is_hit?: boolean
          line_id?: string | null
          name?: string
          purpose?: string | null
          short_description?: string | null
          slug?: string
          sort?: number
          status?: Database["public"]["Enums"]["product_status"]
          suitable_for?: string[]
          updated_at?: string
          usage_steps?: Json
          video_url?: string | null
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "product_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          avito_url: string | null
          contact_email: string | null
          contact_max: string | null
          contact_phone: string | null
          contact_telegram: string | null
          contact_whatsapp: string | null
          dealers_page_enabled: boolean
          id: number
          logo_url: string | null
          own_shop_url: string | null
          ozon_url: string | null
          postal_address: string | null
          seller_inn: string | null
          seller_name: string | null
          seller_status: string | null
          shipping_city: string | null
          updated_at: string
          wildberries_url: string | null
          yandex_market_url: string | null
        }
        Insert: {
          avito_url?: string | null
          contact_email?: string | null
          contact_max?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          dealers_page_enabled?: boolean
          id?: number
          logo_url?: string | null
          own_shop_url?: string | null
          ozon_url?: string | null
          postal_address?: string | null
          seller_inn?: string | null
          seller_name?: string | null
          seller_status?: string | null
          shipping_city?: string | null
          updated_at?: string
          wildberries_url?: string | null
          yandex_market_url?: string | null
        }
        Update: {
          avito_url?: string | null
          contact_email?: string | null
          contact_max?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          dealers_page_enabled?: boolean
          id?: number
          logo_url?: string | null
          own_shop_url?: string | null
          ozon_url?: string | null
          postal_address?: string | null
          seller_inn?: string | null
          seller_name?: string | null
          seller_status?: string | null
          shipping_city?: string | null
          updated_at?: string
          wildberries_url?: string | null
          yandex_market_url?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          newsletter_consent: boolean
          product_id: string | null
          topic: string
        }
        Insert: {
          consent: boolean
          created_at?: string
          email: string
          id?: string
          newsletter_consent?: boolean
          product_id?: string | null
          topic?: string
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          newsletter_consent?: boolean
          product_id?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_leads: {
        Row: {
          admin_note: string | null
          business_type: string
          city: string
          comment: string | null
          company: string
          consent: boolean
          created_at: string
          id: string
          inn: string | null
          messenger_contact: string | null
          messenger_type: string | null
          name: string
          newsletter_consent: boolean
          phone: string
          sales_links: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          admin_note?: string | null
          business_type: string
          city: string
          comment?: string | null
          company: string
          consent: boolean
          created_at?: string
          id?: string
          inn?: string | null
          messenger_contact?: string | null
          messenger_type?: string | null
          name: string
          newsletter_consent?: boolean
          phone: string
          sales_links?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          admin_note?: string | null
          business_type?: string
          city?: string
          comment?: string | null
          company?: string
          consent?: boolean
          created_at?: string
          id?: string
          inn?: string | null
          messenger_contact?: string | null
          messenger_type?: string | null
          name?: string
          newsletter_consent?: boolean
          phone?: string
          sales_links?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      lead_status: "new" | "approved" | "rejected"
      product_status: "published" | "soon" | "hidden"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      lead_status: ["new", "approved", "rejected"],
      product_status: ["published", "soon", "hidden"],
    },
  },
} as const
