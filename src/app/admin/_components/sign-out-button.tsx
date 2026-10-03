"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ redirectTo: "/login" })}>登出</button>
  );
}
