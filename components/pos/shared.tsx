"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/inventory/shared";
import { PageHeader } from "@/components/core-setup/shared";
import { usePos } from "./pos-provider";
import { cents, moneyCents } from "@/lib/pos-calculations";
import type { Customer, Sale } from "@/types/pos";
import { Printer, ReceiptText } from "lucide-react";
export { moneyCents as money } from "@/lib/pos-calculations";
export const dateTime = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
export function PosHeader(
  props: Omit<React.ComponentProps<typeof PageHeader>, "eyebrow">,
) {
  return <PageHeader {...props} eyebrow="Module 03 · Retail POS" />;
}
export function PosModal({
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  wide = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 ${wide ? "sm:max-w-[760px]" : "sm:max-w-[540px]"}`}
      >
        <DialogHeader className="shrink-0 border-b px-5 py-5 pr-12 sm:pl-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {children}
        </div>
        {footer && (
          <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4 sm:px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-60 place-items-center rounded-2xl border border-dashed p-8 text-center">
      <div>
        <ReceiptText className="mx-auto mb-4 size-9 text-primary/30" />
        <h3 className="font-semibold">{title}</h3>
        <p className="mx-auto mb-5 mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}
export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
export function OpenShiftDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data, mutate, busy } = usePos();
  const [location, setLocation] = useState(data.catalog.locations[0]?.id ?? "");
  const [register, setRegister] = useState("Counter 01");
  const [amount, setAmount] = useState("0");
  return (
    <PosModal
      open={open}
      onOpenChange={onOpenChange}
      title="Open your register"
      description="Count the starting cash in the drawer. Every sale will be linked to this shift."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              !location ||
              !register.trim() ||
              !Number.isFinite(Number(amount)) ||
              Number(amount) < 0 ||
              amount === ""
            }
            onClick={async () => {
              if (
                await mutate({
                  action: "shift.open",
                  locationId: location,
                  register,
                  openingCents: cents(Number(amount)),
                })
              )
                onOpenChange(false);
            }}
          >
            Open shift
          </Button>
        </>
      }
    >
      <FormField label="Retail location">
        <select
          className="field-select"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          {data.catalog.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Register name">
        <Input
          value={register}
          maxLength={40}
          onChange={(e) => setRegister(e.target.value)}
        />
      </FormField>
      <FormField label="Opening cash (USD)">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </FormField>
      <p className="text-xs leading-5 text-muted-foreground">
        A register and cashier can each have only one open shift. This records
        cash; it does not open a physical cash drawer.
      </p>
    </PosModal>
  );
}
export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data, mutate, busy } = usePos();
  const [rate, setRate] = useState(String(data.pos.settings.taxBps / 100));
  const [note, setNote] = useState(data.pos.settings.receiptNote);
  return (
    <PosModal
      open={open}
      onOpenChange={onOpenChange}
      title="Checkout configuration"
      description="Confirm the rate applicable to your business before accepting sales."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              rate === "" ||
              !Number.isFinite(Number(rate)) ||
              Number(rate) < 0 ||
              Number(rate) > 25
            }
            onClick={async () => {
              if (
                await mutate({
                  action: "settings.save",
                  taxBps: Math.round(Number(rate) * 100),
                  receiptNote: note,
                })
              )
                onOpenChange(false);
            }}
          >
            Confirm configuration
          </Button>
        </>
      }
    >
      <FormField label="Sales tax (%)">
        <Input
          type="number"
          step="0.01"
          min="0"
          max="25"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
      </FormField>
      <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
        No legal tax rate is assumed. This single-rate configuration applies to
        taxable products at all POS stores. Enter 0 only when appropriate.
        Jurisdiction-specific tax rules require a tax integration.
      </p>
      <FormField label="Receipt footer">
        <Input
          value={note}
          maxLength={250}
          onChange={(e) => setNote(e.target.value)}
        />
      </FormField>
    </PosModal>
  );
}
export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  customer?: Customer;
  onSaved?: (id: string) => void;
}) {
  const { mutate, busy } = usePos();
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  return (
    <PosModal
      open={open}
      onOpenChange={onOpenChange}
      title={customer ? "Edit customer" : "New customer"}
      description="Attach purchases to an account for receipt history and store credit."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={busy || name.trim().length < 2}
            onClick={async () => {
              const result = await mutate({
                action: "customer.save",
                id: customer?.id,
                name,
                email,
                phone,
                notes,
              });
              if (result) {
                onOpenChange(false);
                if (result.id) onSaved?.(result.id);
              }
            }}
          >
            Save customer
          </Button>
        </>
      }
    >
      <FormField label="Full name">
        <Input
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email (optional)">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Phone (optional)">
          <Input
            value={phone}
            maxLength={40}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Notes">
        <Input
          value={notes}
          maxLength={1000}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormField>
    </PosModal>
  );
}
export function ReceiptDialog({
  sale,
  onClose,
}: {
  sale: Sale | null;
  onClose: () => void;
}) {
  if (!sale) return null;
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="pos-receipt-dialog flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[500px]">
        <DialogHeader className="shrink-0 border-b p-5 pr-12">
          <DialogTitle>Sale receipt</DialogTitle>
          <DialogDescription>
            Server-confirmed transaction · {sale.reference}
          </DialogDescription>
        </DialogHeader>
        <div className="pos-receipt min-h-0 flex-1 overflow-y-auto p-6">
          <div className="border-b border-dashed pb-5 text-center">
            <p className="text-3xl font-semibold tracking-[0.15em]">FLAIR</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em]">
              Cosmetic & Fragrance
            </p>
            <p className="mt-4 text-xs">{sale.locationName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dateTime(sale.createdAt)}
            </p>
          </div>
          <div className="my-4 space-y-1 text-xs">
            <p>
              Receipt: <strong>{sale.reference}</strong>
            </p>
            <p>Cashier: {sale.actor}</p>
            <p>Customer: {sale.customerName}</p>
          </div>
          <div className="space-y-4 border-y border-dashed py-4">
            {sale.lines.map((l) => (
              <div key={l.productId}>
                <div className="flex justify-between gap-5 text-sm">
                  <span>{l.name}</span>
                  <strong className="shrink-0">
                    {moneyCents(l.totalCents - l.taxCents)}
                  </strong>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {l.quantity} × {moneyCents(l.unitPriceCents)} · SKU {l.sku}
                  {l.discountCents > 0
                    ? ` · Discount ${moneyCents(l.discountCents)}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2 py-4 text-sm">
            {[
              ["Subtotal", sale.subtotalCents],
              ["Discount", -sale.discountCents],
              [`Tax (${sale.taxBps / 100}%)`, sale.taxCents],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span>{label}</span>
                <span>{moneyCents(Number(value))}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <span>Total</span>
              <span>{moneyCents(sale.totalCents)}</span>
            </div>
          </div>
          <div className="space-y-2 border-t border-dashed pt-4 text-xs">
            {sale.tenders.map((t) => (
              <div key={t.method} className="flex justify-between gap-4">
                <span>
                  {t.method === "external"
                    ? "External payment"
                    : t.method === "credit"
                      ? "Store credit"
                      : "Cash tendered"}
                  {t.reference ? ` · ${t.reference}` : ""}
                </span>
                <span className="shrink-0">{moneyCents(t.amountCents)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold">
              <span>Change</span>
              <span>{moneyCents(sale.changeCents)}</span>
            </div>
          </div>
          {sale.note && <p className="mt-4 text-xs">{sale.note}</p>}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {sale.receiptNote}
          </p>
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer />
            Print receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
