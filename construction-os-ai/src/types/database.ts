// Hand-written mirror of supabase/migrations/0001_init.sql.
// Once a live Supabase project exists, regenerate with:
//   supabase gen types typescript --project-id <id> > src/types/database.ts

export type OrgRole = "owner" | "admin" | "member";

export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "archived";

export type ConstructionCategory =
  | "residential"
  | "villa"
  | "apartment"
  | "commercial"
  | "factory"
  | "school"
  | "hospital"
  | "other";

export type ProjectContactRole = "owner" | "architect" | "engineer" | "contractor" | "other";

export type AuditAction = "created" | "updated" | "archived" | "restored" | "deleted";

// GenericRelationship[] — left empty since this schema is hand-written rather
// than introspected. `supabase gen types` fills these in for real FK-aware
// embedded-select typing once a live project exists.
type NoRelationships = [];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: NoRelationships;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: NoRelationships;
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          role: OrgRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          profile_id: string;
          role?: OrgRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: NoRelationships;
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string | null;
          name: string;
          description: string | null;
          status: ProjectStatus;
          construction_category: ConstructionCategory;
          plot_size_sqft: number | null;
          built_up_area_sqft: number | null;
          floors_above_ground: number;
          has_basement: boolean;
          basement_count: number;
          location_address: string | null;
          location_lat: number | null;
          location_lng: number | null;
          google_maps_url: string | null;
          cover_image_url: string | null;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          construction_category?: ConstructionCategory;
          plot_size_sqft?: number | null;
          built_up_area_sqft?: number | null;
          floors_above_ground?: number;
          has_basement?: boolean;
          basement_count?: number;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          google_maps_url?: string | null;
          cover_image_url?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: NoRelationships;
      };
      project_contacts: {
        Row: {
          id: string;
          project_id: string;
          role: ProjectContactRole;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          role: ProjectContactRole;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_contacts"]["Insert"]>;
        Relationships: NoRelationships;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_id: string | null;
          entity_type: string;
          entity_id: string;
          action: AuditAction;
          diff: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          actor_id?: string | null;
          entity_type: string;
          entity_id: string;
          action: AuditAction;
          diff?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: NoRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
