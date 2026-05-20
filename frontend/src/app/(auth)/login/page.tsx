import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Acesse seu Second Brain para continuar."
    >
      <LoginForm />
    </AuthLayout>
  );
}
