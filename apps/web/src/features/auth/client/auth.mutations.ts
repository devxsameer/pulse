import { authClient } from "./client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./auth.queries";
import type { SignupInput } from "../schemas/signup.schema";
import { toast } from "sonner";
import type { LoginInput } from "../schemas/login.schema";
import { useNavigate } from "@tanstack/react-router";

export function useGithubLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/callback",
      });
    },

    onSuccess: async () => {
      // Normally won't execute because OAuth redirects immediately.
      toast.success("Logged In Sucessfully");
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
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

    onSuccess: () => {
      toast.success("Logged In Sucessfully");
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
      toast.success("Signed Up Successfully");

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
