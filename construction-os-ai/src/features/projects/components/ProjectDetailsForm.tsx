import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProjectContacts, useSaveProjectContacts, useUpdateProject } from "@/features/projects/hooks";
import {
  CONSTRUCTION_CATEGORY_LABEL,
  PROJECT_CONTACT_ROLE_LABEL,
  type Project,
} from "@/features/projects/types";
import type { ConstructionCategory } from "@/types/database";

const CONTACT_ROLES = ["owner", "architect", "engineer", "contractor"] as const;

const contactSchema = z.object({
  name: z.string().trim(),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email"),
});

const schema = z.object({
  description: z.string(),
  constructionCategory: z.custom<ConstructionCategory>(),
  plotSizeSqft: z.string(),
  builtUpAreaSqft: z.string(),
  floorsAboveGround: z.string(),
  hasBasement: z.boolean(),
  basementCount: z.string(),
  locationAddress: z.string(),
  googleMapsUrl: z.string(),
  contacts: z.object({
    owner: contactSchema,
    architect: contactSchema,
    engineer: contactSchema,
    contractor: contactSchema,
  }),
});

type FormValues = z.infer<typeof schema>;

function toNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function ProjectDetailsForm({ project }: { project: Project }) {
  const { data: contacts, isLoading: contactsLoading } = useProjectContacts(project.id);
  const updateProject = useUpdateProject(project.id);
  const saveContacts = useSaveProjectContacts(project.id);
  const [saved, setSaved] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // keepDirtyValues: when the contacts query resolves after the user has
    // already started editing other fields, only sync the not-yet-touched
    // fields instead of clobbering their in-progress edits.
    resetOptions: { keepDirtyValues: true },
    values: {
      description: project.description ?? "",
      constructionCategory: project.construction_category,
      plotSizeSqft: project.plot_size_sqft?.toString() ?? "",
      builtUpAreaSqft: project.built_up_area_sqft?.toString() ?? "",
      floorsAboveGround: project.floors_above_ground.toString(),
      hasBasement: project.has_basement,
      basementCount: project.basement_count.toString(),
      locationAddress: project.location_address ?? "",
      googleMapsUrl: project.google_maps_url ?? "",
      contacts: Object.fromEntries(
        CONTACT_ROLES.map((role) => {
          const existing = contacts?.find((c) => c.role === role);
          return [role, { name: existing?.name ?? "", phone: existing?.phone ?? "", email: existing?.email ?? "" }];
        }),
      ) as FormValues["contacts"],
    },
  });

  async function onSubmit(values: FormValues) {
    await updateProject.mutateAsync({
      description: values.description || null,
      construction_category: values.constructionCategory,
      plot_size_sqft: toNumberOrNull(values.plotSizeSqft),
      built_up_area_sqft: toNumberOrNull(values.builtUpAreaSqft),
      floors_above_ground: toNumberOrNull(values.floorsAboveGround) ?? 0,
      has_basement: values.hasBasement,
      basement_count: toNumberOrNull(values.basementCount) ?? 0,
      location_address: values.locationAddress || null,
      google_maps_url: values.googleMapsUrl || null,
    });

    await saveContacts.mutateAsync(
      CONTACT_ROLES.map((role) => ({
        role,
        name: values.contacts[role].name.trim(),
        phone: values.contacts[role].phone?.trim() || null,
        email: values.contacts[role].email?.trim() || null,
      })),
    );

    reset(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>Plot, built-up area, floors and location.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Construction type</Label>
            <Controller
              control={control}
              name="constructionCategory"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONSTRUCTION_CATEGORY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="floors">Floors above ground</Label>
            <Input id="floors" type="number" min={0} {...register("floorsAboveGround")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plot-size">Plot size (sq ft)</Label>
            <Input id="plot-size" type="number" min={0} step="0.01" {...register("plotSizeSqft")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="built-up">Built-up area (sq ft)</Label>
            <Input id="built-up" type="number" min={0} step="0.01" {...register("builtUpAreaSqft")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-2">
              <input type="checkbox" className="size-4 rounded accent-primary-500" {...register("hasBasement")} />
              Has basement
            </Label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="basement-count">Basement levels</Label>
            <Input id="basement-count" type="number" min={0} {...register("basementCount")} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="location">Location / address</Label>
            <Input id="location" placeholder="Street, area, city" {...register("locationAddress")} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="maps">Google Maps link</Label>
            <Input id="maps" placeholder="https://maps.google.com/…" {...register("googleMapsUrl")} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea id="description" placeholder="Anything worth remembering about this project" {...register("description")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
          <CardDescription>Owner, architect, engineer and contractor on record.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {contactsLoading ? (
            <p className="text-sm text-black/45 dark:text-white/40">Loading…</p>
          ) : (
            CONTACT_ROLES.map((role) => (
              <div key={role} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label>{PROJECT_CONTACT_ROLE_LABEL[role]} name</Label>
                  <Input {...register(`contacts.${role}.name`)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Phone</Label>
                  <Input {...register(`contacts.${role}.phone`)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" {...register(`contacts.${role}.email`)} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || (!isDirty && !saved)}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="size-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
