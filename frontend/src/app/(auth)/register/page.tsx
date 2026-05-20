import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crie seu Second Brain"
      subtitle="Inicie sua jornada de produtividade e controle."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
