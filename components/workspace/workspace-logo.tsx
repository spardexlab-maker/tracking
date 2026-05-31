"use client";

import { useState } from "react";

export function WorkspaceLogo({
  workspaceId,
  fallbackText,
}: {
  workspaceId: string;
  fallbackText: string;
}) {
  const [error, setError] = useState(false);
  const [timestamp, setTimestamp] = useState(() => Date.now());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/workspace-logos/${workspaceId}/logo.png?t=${timestamp}`;

  if (error || !workspaceId || !supabaseUrl) {
    return (
      <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground">
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt="Workspace Logo"
      className="size-11 rounded-2xl object-cover border border-sidebar-border bg-background"
      onError={() => setError(true)}
    />
  );
}
