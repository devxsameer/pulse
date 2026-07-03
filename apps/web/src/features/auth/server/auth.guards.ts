import { getRequest } from "@tanstack/react-start/server";
import { getServerSessionFn } from "./auth.functions";
import { redirect } from "@tanstack/react-router";
import { getServerSession } from "./auth.server";

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

export async function requireServerSession() {
  const request = getRequest();

  const session = await getServerSession(request);

  if (!session) {
    throw redirect({
      to: "/login",
    });
  }

  return session;
}
