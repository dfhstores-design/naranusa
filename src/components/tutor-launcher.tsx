import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function TutorLauncher() {
  return <Link href="/tutor" className="tutor-launcher" aria-label="Buka Tanya Nara"><MessageCircle size={17} /><span>Tanya Nara</span></Link>;
}
