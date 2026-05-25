import LegalPage from "@/components/LegalPage";
import { TERMS } from "@/constants/legal";

export const metadata = {
  title: "Terms & Conditions — This Is Muay Thai",
  description: "Read the terms and conditions governing your use of This Is Muay Thai and the purchase of training camp packages.",
};

export default function TermsPage() {
  return <LegalPage {...TERMS} />;
}
