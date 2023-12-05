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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      building_change_requests: {
        Row: {
          address_request: string
          created_at: string
          id: number
          tags: Json | null
          user_id: number
        }
        Insert: {
          address_request: string
          created_at?: string
          id?: number
          tags?: Json | null
          user_id: number
        }
        Update: {
          address_request?: string
          created_at?: string
          id?: number
          tags?: Json | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "building_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      buildings: {
        Row: {
          address: string
          created_at: string
          id: number
          neighborhood_id: number
          tags: Json | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: number
          neighborhood_id: number
          tags?: Json | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: number
          neighborhood_id?: number
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          building_id: number
          created_at: string
          id: number
          tags: Json | null
          text_content: string
          user_id: number
        }
        Insert: {
          building_id: number
          created_at?: string
          id?: number
          tags?: Json | null
          text_content: string
          user_id: number
        }
        Update: {
          building_id?: number
          created_at?: string
          id?: number
          tags?: Json | null
          text_content?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      comment_likes: {
        Row: {
          comment_id: number
          id: number
          is_dislike: boolean
          user_id: number
        }
        Insert: {
          comment_id: number
          id?: number
          is_dislike?: boolean
          user_id: number
        }
        Update: {
          comment_id?: number
          id?: number
          is_dislike?: boolean
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          created_at: string
          id: number
          likes_count: number
          parent_comment_id: number | null
          post_id: number
          tags: Json | null
          text_content: string
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          likes_count?: number
          parent_comment_id?: number | null
          post_id: number
          tags?: Json | null
          text_content: string
          user_id: number
        }
        Update: {
          created_at?: string
          id?: number
          likes_count?: number
          parent_comment_id?: number | null
          post_id?: number
          tags?: Json | null
          text_content?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      neighborhoods: {
        Row: {
          created_at: string
          id: number
          name: string
          tags: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          tags?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          tags?: Json | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: number
          is_dislike: boolean
          post_id: number
          user_id: number
        }
        Insert: {
          id?: number
          is_dislike?: boolean
          post_id: number
          user_id: number
        }
        Update: {
          id?: number
          is_dislike?: boolean
          post_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          comments_count: number
          created_at: string
          id: number
          image_url: string
          likes_count: number
          neighborhood_id: number
          tags: Json | null
          text_content: string | null
          user_id: number
        }
        Insert: {
          comments_count?: number
          created_at?: string
          id?: number
          image_url?: string
          likes_count?: number
          neighborhood_id: number
          tags?: Json | null
          text_content?: string | null
          user_id: number
        }
        Update: {
          comments_count?: number
          created_at?: string
          id?: number
          image_url?: string
          likes_count?: number
          neighborhood_id?: number
          tags?: Json | null
          text_content?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reported_comments: {
        Row: {
          comment_id: number
          created_at: string
          id: number
          reason: string | null
          tags: Json | null
          user_id_reporting: number
        }
        Insert: {
          comment_id: number
          created_at?: string
          id?: number
          reason?: string | null
          tags?: Json | null
          user_id_reporting: number
        }
        Update: {
          comment_id?: number
          created_at?: string
          id?: number
          reason?: string | null
          tags?: Json | null
          user_id_reporting?: number
        }
        Relationships: [
          {
            foreignKeyName: "reported_comments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_comments_user_id_reporting_fkey"
            columns: ["user_id_reporting"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reported_posts: {
        Row: {
          created_at: string
          id: number
          post_id: number
          reason: string | null
          tags: Json | null
          user_id_reporting: number
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: number
          reason?: string | null
          tags?: Json | null
          user_id_reporting: number
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number
          reason?: string | null
          tags?: Json | null
          user_id_reporting?: number
        }
        Relationships: [
          {
            foreignKeyName: "reported_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_posts_user_id_reporting_fkey"
            columns: ["user_id_reporting"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tokens: {
        Row: {
          created_at: string
          expiration: string | null
          id: number
          phone_token: string | null
          tags: Json | null
          type: Database["public"]["Enums"]["TokenType"]
          updated_at: string
          user_id: number
          valid: boolean
        }
        Insert: {
          created_at?: string
          expiration?: string | null
          id?: number
          phone_token?: string | null
          tags?: Json | null
          type: Database["public"]["Enums"]["TokenType"]
          updated_at: string
          user_id: number
          valid?: boolean
        }
        Update: {
          created_at?: string
          expiration?: string | null
          id?: number
          phone_token?: string | null
          tags?: Json | null
          type?: Database["public"]["Enums"]["TokenType"]
          updated_at?: string
          user_id?: number
          valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_following: {
        Row: {
          created_at: string
          follower_user_id: number
          following_user_id: number
          id: number
          tags: Json | null
        }
        Insert: {
          created_at?: string
          follower_user_id: number
          following_user_id: number
          id?: number
          tags?: Json | null
        }
        Update: {
          created_at?: string
          follower_user_id?: number
          following_user_id?: number
          id?: number
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_following_follower_user_id_fkey"
            columns: ["follower_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_following_following_user_id_fkey"
            columns: ["following_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          building_id: number | null
          chat_token: string | null
          created_at: string
          followers_count: number
          following_count: number
          id: number
          image: string | null
          is_verified: boolean
          neighborhood_id: number | null
          phone_number: string
          tags: Json | null
          username: string
        }
        Insert: {
          building_id?: number | null
          chat_token?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: number
          image?: string | null
          is_verified?: boolean
          neighborhood_id?: number | null
          phone_number: string
          tags?: Json | null
          username: string
        }
        Update: {
          building_id?: number | null
          chat_token?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: number
          image?: string | null
          is_verified?: boolean
          neighborhood_id?: number | null
          phone_number?: string
          tags?: Json | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      TokenType: "PHONE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
