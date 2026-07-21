import { Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, Avatar, Pill } from "../preview-ui";

const MEMBERS = [
  { name: "Vinod Mehta", email: "vinod@mehtaconstructions.in", role: "Owner" },
  { name: "Priya Nair", email: "priya@mehtaconstructions.in", role: "Admin" },
  { name: "Suresh Kumar", email: "suresh@mehtaconstructions.in", role: "Member" },
];

export function SettingsPreview() {
  usePageTitle("Settings");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Organization profile, team members and workspace defaults."
      />
      <PreviewBanner flag="Mostly no new decisions — mirrors the existing organizations/material_rates tables. Inviting new members needs an email-sending decision (Resend, Supabase email, etc.) later." />

      <Tabs defaultValue="org">
        <TabsList>
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="org">
          <Card>
            <CardHeader>
              <CardTitle>Organization profile</CardTitle>
              <CardDescription>Visible to all team members</CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-md flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Organization name</Label>
                <Input disabled defaultValue="Mehta Constructions Pvt. Ltd." />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Workspace slug</Label>
                <Input disabled defaultValue="mehta-constructions" />
              </div>
              <Button disabled className="w-fit">
                Save changes (preview only)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>3 members in this workspace</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {MEMBERS.map((m) => (
                <div key={m.email} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-black/45 dark:text-white/40">{m.email}</p>
                    </div>
                  </div>
                  <Pill variant={m.role === "Owner" ? "primary" : "neutral"}>{m.role}</Pill>
                </div>
              ))}
              <div className="pt-4">
                <Button variant="outline" disabled>
                  Invite member (preview only)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-danger/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-danger">
                <ShieldAlert className="size-4" />
                Danger zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="danger" disabled>
                Delete organization (preview only)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
