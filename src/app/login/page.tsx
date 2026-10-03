"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");

  return (
    <main>
      <h1>Admin 登入</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const form = new FormData(e.currentTarget);
          const res = await signIn("credentials", {
            username: String(form.get("username") ?? ""),
            password: String(form.get("password") ?? ""),
            redirect: false,
          });
          if (res?.error) {
            setError("登入失敗");
          } else {
            window.location.href = "/";
          }
        }}
      >
        <div>
          <label>
            帳號 <input name="username" autoComplete="username" />
          </label>
        </div>
        <div>
          <label>
            密碼{" "}
            <input
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </label>
        </div>
        <button type="submit">登入</button>
        {error && <p>{error}</p>}
      </form>
    </main>
  );
}
