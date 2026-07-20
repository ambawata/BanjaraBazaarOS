import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";

export interface CurrentOrganization {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
}

// Every user gets a personal organization on sign-up (see handle_new_user trigger).
// This resolves the first (primary) organization the signed-in user belongs to.
export function useOrganization() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["organization", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CurrentOrganization> => {
      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("profile_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (membershipError) throw membershipError;

      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("id", membership.organization_id)
        .single();

      if (organizationError) throw organizationError;

      return {
        id: organization.id,
        name: organization.name,
        role: membership.role,
      };
    },
  });
}
