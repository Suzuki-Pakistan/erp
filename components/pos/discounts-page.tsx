"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Gift, Percent, Plus, Tag } from "lucide-react";

import { FormField } from "@/components/inventory/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { canManagePos } from "@/types/auth";
import type { DiscountProgram, DiscountType } from "@/types/pos";
import { useSessionUser } from "@/components/auth/session-provider";
import { usePos } from "./pos-provider";
import { Metric, PosHeader, PosModal } from "./shared";

export function DiscountsPage() {
  const { data, busy, mutate } = usePos();
  const user = useSessionUser();
  const canManage = canManagePos(user);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DiscountProgram | null>(null);
  const active = data.pos.discounts.filter((discount) => discount.active);
  const discountedSales = data.pos.sales.filter(
    (sale) => sale.promotion && sale.promotion !== "none",
  );

  function edit(discount: DiscountProgram | null) {
    setSelected(discount);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PosHeader
        title="Discounts & promotions"
        description="Create approved campaigns once, then apply them from the retail checkout without changing product prices."
        actions={
          canManage ? (
            <Button onClick={() => edit(null)}>
              <Plus />
              Create discount
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Active campaigns"
          value={String(active.length)}
          detail="Available at retail checkout"
        />
        <Metric
          label="Buy 1 Get 1"
          value={String(
            data.pos.discounts.filter(
              (discount) => discount.type === "buy-one-get-one",
            ).length,
          )}
          detail="Pair-based promotions"
        />
        <Metric
          label="Percentage offers"
          value={String(
            data.pos.discounts.filter(
              (discount) => discount.type === "percentage",
            ).length,
          )}
          detail="Campaign-wide retail discounts"
        />
        <Metric
          label="Discounted sales"
          value={String(discountedSales.length)}
          detail="Completed sale audit records"
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {data.pos.discounts.map((discount) => {
          const Icon =
            discount.type === "buy-one-get-one" ? Gift : Percent;
          return (
            <Card key={discount.id} className="overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/7 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{discount.name}</h2>
                      <Badge
                        variant={discount.active ? "default" : "secondary"}
                        className="rounded-md text-[9px]"
                      >
                        {discount.active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {discount.code}
                    </p>
                  </div>
                  {canManage && (
                    <Switch
                      aria-label={`${discount.active ? "Pause" : "Activate"} ${discount.name}`}
                      checked={discount.active}
                      disabled={busy}
                      onCheckedChange={(active) =>
                        void mutate({
                          action: "discount.toggle",
                          id: discount.id,
                          active,
                        })
                      }
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Checkout rule
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {discount.type === "buy-one-get-one"
                      ? "Buy one item, get the lower-priced item in the pair free"
                      : `${discount.valueBps / 100}% off the eligible retail cart`}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Retail only. Product price floors and the server-calculated
                    total are validated again at payment.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    {discount.active
                      ? "Ready to apply in POS"
                      : "Hidden from POS until activated"}
                  </span>
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => edit(discount)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-primary/10 bg-primary/[0.025]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Tag className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Apply at checkout</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Add eligible items, choose an active campaign under Sale discount,
              and the POS recalculates discount, tax and total immediately.
            </p>
          </div>
          <Button asChild>
            <Link href="/retail-pos">Open POS terminal</Link>
          </Button>
        </CardContent>
      </Card>

      {open && (
        <DiscountEditor
          key={selected?.id ?? "new"}
          discount={selected}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function DiscountEditor({
  discount,
  onClose,
}: {
  discount: DiscountProgram | null;
  onClose: () => void;
}) {
  const { busy, mutate } = usePos();
  const [name, setName] = useState(discount?.name ?? "");
  const [code, setCode] = useState(discount?.code ?? "");
  const [type, setType] = useState<DiscountType>(
    discount?.type ?? "percentage",
  );
  const [percent, setPercent] = useState(
    String((discount?.valueBps ?? 2000) / 100),
  );
  const [active, setActive] = useState(discount?.active ?? true);
  const validPercent =
    type === "buy-one-get-one" ||
    (Number.isFinite(Number(percent)) &&
      Number(percent) >= 1 &&
      Number(percent) <= 100);

  return (
    <PosModal
      open
      onOpenChange={(next) => !next && !busy && onClose()}
      title={discount ? "Edit discount" : "Create discount"}
      description="Configure an approved retail campaign. Historical receipts retain the discount name used at checkout."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              name.trim().length < 2 ||
              code.trim().length < 2 ||
              !/^[A-Za-z0-9-]+$/.test(code.trim()) ||
              !validPercent
            }
            onClick={async () => {
              if (
                await mutate({
                  action: "discount.save",
                  id: discount?.id,
                  name: name.trim(),
                  code: code.trim().toUpperCase(),
                  type,
                  valueBps:
                    type === "buy-one-get-one"
                      ? 10000
                      : Math.round(Number(percent) * 100),
                  active,
                })
              )
                onClose();
            }}
          >
            Save discount
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Discount name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Black Friday 20% Off"
            maxLength={100}
          />
        </FormField>
        <FormField label="Code">
          <Input
            value={code}
            onChange={(event) =>
              setCode(
                event.target.value
                  .replace(/[^A-Za-z0-9-]/g, "")
                  .toUpperCase(),
              )
            }
            placeholder="BLACKFRIDAY"
            maxLength={24}
          />
        </FormField>
      </div>
      <FormField label="Discount type">
        <select
          className="field-select"
          value={type}
          onChange={(event) => setType(event.target.value as DiscountType)}
        >
          <option value="percentage">Percentage off</option>
          <option value="buy-one-get-one">Buy 1 Get 1 Free</option>
        </select>
      </FormField>
      {type === "percentage" && (
        <FormField label="Discount percent">
          <Input
            type="number"
            min="1"
            max="100"
            step="0.25"
            value={percent}
            onChange={(event) => setPercent(event.target.value)}
          />
        </FormField>
      )}
      <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
        <span>
          <span className="block text-sm font-semibold">Active in POS</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Cashiers can select this campaign immediately.
          </span>
        </span>
        <Switch checked={active} onCheckedChange={setActive} />
      </label>
    </PosModal>
  );
}
