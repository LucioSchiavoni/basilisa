import { ChangePasswordForm } from "./change-password-form";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;
  return <ChangePasswordForm isSettingNew={set === "1"} />;
}
