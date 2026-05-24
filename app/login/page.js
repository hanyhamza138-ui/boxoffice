"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#111]
      "
    >

      <div
        className="
          bg-[#1c1c1c]
          p-8
          rounded-2xl
          w-[400px]
        "
      >

        <h1 className="text-3xl mb-6 text-white">
          Login
        </h1>

        <input
          placeholder="Email"
          className="
            w-full
            p-3
            rounded-lg
            mb-4
            text-black
          "
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="
            w-full
            p-3
            rounded-lg
            mb-4
            text-black
          "
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
          className="
            w-full
            bg-green-500
            p-3
            rounded-lg
          "
        >
          Login
        </button>

      </div>

    </main>
  );
}