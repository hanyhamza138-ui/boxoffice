import { supabase } from "../lib/supabase";
import HomeContent from "./components/HomeContent";
import { cookies } from "next/headers";

import ar from "../translations/ar";
import en from "../translations/en";

export default async function HomePage() {

  const cookieStore =
    await cookies();

  const language =
    cookieStore.get("language")?.value ||
    "en";

  const t =
    language === "ar"
      ? ar
      : en;

  const { data: movies, error } =
    await supabase
      .from("movies")
      .select("*")
      .order("revenue", {
        ascending: false,
      });

  if (error) {
    return (
      <main
        style={{
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1>
          {language === "ar"
            ? "خطأ في تحميل الأفلام"
            : "Error Loading Movies"}
        </h1>

        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <HomeContent
      movies={movies || []}
      t={t}
    />
  );
}