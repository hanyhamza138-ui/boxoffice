"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    // ⚠️ بسيط (هنطوره بعدين)
    if (password === "admin123") {
      document.cookie = "admin=true; path=/";
      router.push("/admin");
    } else {
      alert("Wrong password");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, marginTop: 10 }}
        />

        <br />

        <button style={{ marginTop: 10 }}>
          Login
        </button>
      </form>
    </div>
  );
}