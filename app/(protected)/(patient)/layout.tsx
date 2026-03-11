import { PatientShell } from "@/components/patient-shell";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientShell>{children}</PatientShell>;
}
