import { redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";

import { getAuth } from "#/lib/auth";
import { resolveWorkspaceId } from "#/features/workspaces/server/workspaces.repository";

export async function getServerSession(request: Request) {
  return getAuth().api.getSession({
    headers: request.headers,
  });
}

export async function requireServerSession() {
  const session = await getServerSession(getRequest());

  if (!session) {
    throw redirect({
      to: "/login",
    });
  }

  return session;
}

export type WorkspaceContext = {
  userId: string;
  workspaceId: string;
};

export async function requireWorkspace(): Promise<WorkspaceContext> {
  const { user, session } = await requireServerSession();

  // Sessions created before workspaces existed have no active workspace yet.
  const workspaceId =
    session.activeOrganizationId ?? (await resolveWorkspaceId(user.id));

  return { userId: user.id, workspaceId };
}
