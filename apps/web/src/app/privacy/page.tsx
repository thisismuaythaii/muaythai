import LegalPage from "@/components/LegalPage";
import { PRIVACY } from "@/constants/legal";

export const metadata = {
  title: "Privacy Policy — This Is Muay Thai",
  description: "Learn how This Is Muay Thai collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return <LegalPage {...PRIVACY} />;
}
