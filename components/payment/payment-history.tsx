"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listPayments, type PaymentHistoryItem } from "@/lib/api/commerce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<
  PaymentHistoryItem["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  SUCCEEDED: "default",
  FAILED: "destructive",
  CANCELLED: "outline",
  REFUNDED: "secondary",
  DISPUTED: "secondary",
  CHARGEBACK: "destructive",
};

const REVOKED_STATUSES: PaymentHistoryItem["status"][] = ["REFUNDED", "CHARGEBACK", "DISPUTED"];

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount / 100);
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPayments()
      .then((result) => {
        if (!cancelled) setPayments(result);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load your payment history.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!payments) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const activeAccess = payments.some((payment) => payment.status === "SUCCEEDED" && !payment.refund);
  const revokedAccess = !activeAccess && payments.some((payment) => REVOKED_STATUSES.includes(payment.status));

  if (payments.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">You haven&apos;t purchased any tracks yet.</p>
        <Link href="/pricing">
          <Button>View available offerings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {revokedAccess && (
        <Alert variant="destructive">
          <AlertTitle>Access revoked</AlertTitle>
          <AlertDescription>
            Your access was reversed following a refund or chargeback. Contact support if you believe this is a mistake.
          </AlertDescription>
        </Alert>
      )}
      {activeAccess && (
        <Alert>
          <AlertTitle>Access active</AlertTitle>
          <AlertDescription>You have active access from a completed purchase.</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Offering</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.offeringTitle}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[payment.status]}>{payment.status}</Badge>
              </TableCell>
              <TableCell>{formatAmount(payment.amount, payment.currency)}</TableCell>
              <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
