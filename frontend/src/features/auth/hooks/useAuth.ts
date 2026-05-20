import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { LoginDTO, RegisterDTO } from "../types";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginDTO) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/dashboard"); // Rota do sistema interno
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterDTO) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    },
  });
}
