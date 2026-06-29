import { getServerSessionFn } from "./auth.functions";
import { redirect } from "@tanstack/react-router";

export async function requireAuth() {
  const session = await getServerSessionFn();

  if (!session) {
    throw redirect({
      to: "/login",
    });
  }

  return session;
}

export async function requireGuest() {
  const session = await getServerSessionFn();

  if (session) {
    throw redirect({
      to: "/",
    });
  }
}
