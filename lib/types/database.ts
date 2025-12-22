export interface Database {
  public: {
    Tables: {
      media_items: {
        Row: {
          id: string;
          storage_path: string;
          file_type: 'image' | 'video';
          file_name: string;
          file_size: number;
          mime_type: string;
          uploader_ip: string | null;
          uploader_name: string | null;
          caption: string | null;
          is_approved: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          file_type: 'image' | 'video';
          file_name: string;
          file_size: number;
          mime_type: string;
          uploader_ip?: string | null;
          uploader_name?: string | null;
          caption?: string | null;
          is_approved?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          storage_path?: string;
          file_type?: 'image' | 'video';
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          uploader_ip?: string | null;
          uploader_name?: string | null;
          caption?: string | null;
          is_approved?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          media_id: string;
          commenter_name: string | null;
          commenter_ip: string | null;
          content: string;
          is_approved: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          commenter_name?: string | null;
          commenter_ip?: string | null;
          content: string;
          is_approved?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          commenter_name?: string | null;
          commenter_ip?: string | null;
          content?: string;
          is_approved?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type MediaItem = Database['public']['Tables']['media_items']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export type MediaItemInsert = Database['public']['Tables']['media_items']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

