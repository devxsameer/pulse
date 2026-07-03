import { authClient } from "./client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./auth.queries";
import type { SignupInput } from "../schemas/signup.schema";
import { toast } from "sonner";
import type { LoginInput } from "../schemas/login.schema";
import { useNavigate } from "@tanstack/react-router";

export function useGithubLogin() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/callback",
      });

      if (error) throw error;
    },
    onError: (err) => {
      toast.error(err.message || "Failed to continue with GitHub");
    },
  });
}
export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { error } = await authClient.signIn.email({
        email: input.email,
        password: input.password,
        callbackURL: "/",
      });

      if (error) throw error;
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });
}
export function useSignup() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const { error } = await authClient.signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
      });

      if (error) throw error;
    },

    onSuccess: async () => {
      navigate({
        to: "/",
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });

      navigate({
        to: "/",
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
