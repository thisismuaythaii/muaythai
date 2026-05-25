import LegalPage from "@/components/LegalPage";
import { REFUND } from "@/constants/legal";

export const metadata = {
  title: "Cancellation & Refund Policy — This Is Muay Thai",
  description: "Understand the cancellation and refund terms for This Is Muay Thai training camp bookings.",
};

export default function RefundPolicyPage() {
  return <LegalPage {...REFUND} />;
}
