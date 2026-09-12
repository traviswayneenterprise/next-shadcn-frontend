import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { PaymentHistory } from "@/components/payment/payment-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = constructMetadata({ title: "Access and payments", description: "View LMS access and purchase a learning track." });

export default function BillingPage() {
  return (
    <>
      <DashboardHeader
        heading="Access and payments"
        text="Paystack-backed purchases and manual grants determine your learning access."
      />
      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistory />
        </CardContent>
      </Card>
    </>
  );
}
