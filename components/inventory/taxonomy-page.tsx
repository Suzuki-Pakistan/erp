"use client";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Tags, Shapes, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useInventory } from "./inventory-provider";
import { FormField, InventoryEmpty, InventoryHeader } from "./shared";
import type { Taxonomy } from "@/types/inventory";
export function TaxonomyPage() {
  const { data, canWrite, mutate, busy } = useInventory();
  const [kind, setKind] = useState<"categories" | "brands">("categories");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<
    (Omit<Taxonomy, "id"> & { id?: string }) | null
  >(null);
  const [deleting, setDeleting] = useState<Taxonomy | null>(null);
  const rows = data[kind].filter((i) =>
    [i.name, i.code].some((v) => v.toLowerCase().includes(query.toLowerCase())),
  );
  const count = (id: string) =>
    data.products.filter(
      (p) => (kind === "brands" ? p.brandId : p.categoryId) === id,
    ).length;
  return (
    <div className="space-y-6">
      <InventoryHeader
        title="Categories & Brands"
        description="Keep the catalog organized with clear merchandising categories and consistent brand identities."
        actions={
          canWrite && (
            <Button
              onClick={() =>
                setForm({
                  name: "",
                  code: "",
                  description: "",
                  color: "#b69154",
                })
              }
            >
              <Plus />
              Add {kind === "brands" ? "brand" : "category"}
            </Button>
          )
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={kind}
          onValueChange={(v) => {
            setKind(v as typeof kind);
            setQuery("");
          }}
        >
          <TabsList>
            <TabsTrigger value="categories">
              <Shapes />
              Categories ({data.categories.length})
            </TabsTrigger>
            <TabsTrigger value="brands">
              <Tags />
              Brands ({data.brands.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={"Search " + kind + "…"}
          />
        </div>
      </div>
      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((item) => (
            <Card key={item.id} className="gap-0 overflow-hidden p-0">
              <div className="flex items-start gap-3 p-5">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    backgroundColor: item.color + "20",
                    color: item.color,
                  }}
                >
                  {kind === "brands" ? (
                    <Tags className="size-5" />
                  ) : (
                    <Shapes className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {item.code}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={"Edit " + item.name}
                      onClick={() => setForm(item)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={"Delete " + item.name}
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="min-h-12 px-5 text-xs leading-5 text-muted-foreground">
                {item.description || "No description added."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t bg-muted/20 px-5 py-3">
                <span className="text-xs font-medium">
                  {count(item.id)} products
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {count(item.id) ? "In use" : "Ready for products"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <InventoryEmpty />
        </Card>
      )}
      <Dialog open={!!form} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form?.id ? "Edit" : "Add"}{" "}
              {kind === "brands" ? "brand" : "category"}
            </DialogTitle>
            <DialogDescription>
              Names and codes must be unique. Existing product assignments are
              preserved.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await mutate({ action: "taxonomy.save", kind, item: form }))
                  setForm(null);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Name *">
                  <Input
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </FormField>
                <FormField label="Code *">
                  <Input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Description">
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Color">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-20 rounded border"
                />
              </FormField>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  <Save />
                  Save {kind === "brands" ? "brand" : "category"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name}?</DialogTitle>
            <DialogDescription>
              {deleting && count(deleting.id) > 0
                ? "This record has assigned products. Move those products to another record before deleting it."
                : "This unused record will be removed from the catalog taxonomy."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleting || count(deleting.id) > 0 || busy}
              onClick={async () => {
                if (
                  deleting &&
                  (await mutate({
                    action: "taxonomy.delete",
                    kind,
                    id: deleting.id,
                  }))
                )
                  setDeleting(null);
              }}
            >
              Delete record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
