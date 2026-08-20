
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { supabase } from "../../../lib/supabase";
import AdminNav from "../../components/AdminNav";

export const dynamic = "force-dynamic";

/* ==========================================================
   WORK DAY PAGE
========================================================== */

export default async function WorkDayPage() {
  /* ========================================================
     START DATE
  ======================================================== */

  const startDate = "2026-01-01";

  /* ========================================================
     CURRENT DATE
     
     نستخدم تاريخ الجهاز الحالي
  ======================================================== */

  const today =
    new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Cairo",
}).format(new Date())

  /* ========================================================
     LOAD WORK DAYS
     
     من 01/01/2026 حتى اليوم
     مرتبة تصاعدياً
  ======================================================== */

  const {
    data: workDays,
    error,
  } = await supabase
    .from("boxoffice_days")
    .select("*")
    .gte(
      "work_date",
      startDate
    )
    .lte(
      "work_date",
      today
    )
    .order("work_date", {
      ascending: true,
    });

  /* ========================================================
     CREATE WORK DAY
  ======================================================== */

  async function createWorkDay(formData) {
    "use server";

    const selectedDate =
      formData.get("work_date");

    if (!selectedDate) {
      return;
    }

    /* ------------------------------------------------------
       Prevent dates before 2026
    ------------------------------------------------------ */

    if (
      selectedDate <
      "2026-01-01"
    ) {
      return;
    }

    /* ------------------------------------------------------
       Prevent future dates
    ------------------------------------------------------ */

    const currentDate =
      new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Cairo",
}).format(new Date())

    /* ------------------------------------------------------
       Check existing day
    ------------------------------------------------------ */

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("boxoffice_days")
      .select("*")
      .eq(
        "work_date",
        selectedDate
      )
      .maybeSingle();

    if (existingError) {
      throw new Error(
        existingError.message
      );
    }

    /* ------------------------------------------------------
       Existing day
    ------------------------------------------------------ */

    if (existing) {
      /* -----------------------------------------------
         إذا كان مغلقاً نفتحه
      ------------------------------------------------ */

      if (
        existing.status !==
        "open"
      ) {
        const {
          error: updateError,
        } = await supabase
          .from("boxoffice_days")
          .update({
            status: "open",
          })
          .eq(
            "id",
            existing.id
          );

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }
      }

      revalidatePath(
        "/admin/work-day"
      );

      revalidatePath(
        `/admin/work-day/${existing.id}`
      );

      return;
    }

    /* ------------------------------------------------------
       Create new day
    ------------------------------------------------------ */

    const {
      data: newDay,
      error: insertError,
    } = await supabase
      .from("boxoffice_days")
      .insert({
        work_date:
          selectedDate,
        status: "open",
      })
      .select()
      .single();

    if (
      insertError ||
      !newDay
    ) {
      throw new Error(
        insertError?.message ||
          "Unable to create Work Day."
      );
    }

    revalidatePath(
      "/admin/work-day"
    );

    revalidatePath(
      `/admin/work-day/${newDay.id}`
    );

    return;
  }

  /* ========================================================
     OPEN EXISTING DAY
  ======================================================== */

  async function openWorkDay(
    formData
  ) {
    "use server";

    const id =
      formData.get("id");

    if (!id) {
      return;
    }

    const {
      data: selectedDay,
      error: selectedDayError,
    } = await supabase
      .from("boxoffice_days")
      .select(
        "id,work_date,status"
      )
      .eq(
        "id",
        Number(id)
      )
      .single();

    if (
      selectedDayError ||
      !selectedDay
    ) {
      throw new Error(
        selectedDayError?.message ||
          "Work Day not found."
      );
    }

    /* ------------------------------------------------------
       Do not allow dates before 2026
    ------------------------------------------------------ */

    if (
      selectedDay.work_date <
      "2026-01-01"
    ) {
      return;
    }

    /* ------------------------------------------------------
       Open selected day
    ------------------------------------------------------ */

    const {
      error: updateError,
    } = await supabase
      .from("boxoffice_days")
      .update({
        status: "open",
      })
      .eq(
        "id",
        Number(id)
      );

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    revalidatePath(
      "/admin/work-day"
    );

    revalidatePath(
      `/admin/work-day/${id}`
    );
  }

  /* ========================================================
     FORMAT DATE
  ======================================================== */

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const parts =
      String(value).split("-");

    if (
      parts.length !== 3
    ) {
      return value;
    }

    const [
      year,
      month,
      day,
    ] = parts;

    return `${day}/${month}/${year}`;
  }

  /* ========================================================
     CHECK TODAY
  ======================================================== */

  function isToday(value) {
    return (
      value === today
    );
  }

  /* ========================================================
     UI
  ======================================================== */

  return (
    <main
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: 30,
      }}
    >
      <AdminNav />

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          marginTop: 25,
          marginBottom: 25,
        }}
      >
        <h1
          style={{
            fontSize: 34,
            marginBottom: 8,
          }}
        >
          📅 Work Day
        </h1>

        <p
          style={{
            color: "#9ca3af",
            margin: 0,
          }}
        >
          جميع أيام العمل من
          {" "}
          <strong
            style={{
              color: "#fff",
            }}
          >
            01/01/2026
          </strong>
          {" "}
          حتى اليوم
          {" "}
          <strong
            style={{
              color: "#4ade80",
            }}
          >
            {formatDate(today)}
          </strong>
        </p>
      </div>

      {/* ==================================================
          CREATE NEW WORK DAY
      ================================================== */}

      <div
        style={{
          background: "#1c1c1c",
          padding: 25,
          borderRadius: 14,
          maxWidth: 700,
          marginBottom: 30,
          border:
            "1px solid #333",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          ➕ فتح يوم عمل
        </h2>

        <p
          style={{
            color: "#9ca3af",
            marginTop: 0,
          }}
        >
          اختر تاريخ يوم العمل.
        </p>

        <form
          action={createWorkDay}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            name="work_date"
            min="2026-01-01"
            defaultValue={today}
            required
            style={{
              padding: 13,
              borderRadius: 9,
              border:
                "1px solid #444",
              background: "#111",
              color: "#fff",
              fontSize: 15,
            }}
          />

          <button
            type="submit"
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding:
                "13px 22px",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ فتح يوم العمل
          </button>
        </form>
      </div>

      {/* ==================================================
          DATABASE ERROR
      ================================================== */}

      {error && (
        <div
          style={{
            background: "#7f1d1d",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          ❌ حدث خطأ أثناء تحميل أيام العمل.
          <div
            style={{
              marginTop: 6,
              color: "#fecaca",
              fontSize: 13,
            }}
          >
            {error.message}
          </div>
        </div>
      )}

      {/* ==================================================
          WORK DAYS LIST
      ================================================== */}

      <div
        style={{
          background: "#1c1c1c",
          padding: 25,
          borderRadius: 14,
          border:
            "1px solid #333",
        }}
      >
        {/* ==================================================
            LIST HEADER
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              📋 أيام العمل
            </h2>

            <div
              style={{
                color: "#6b7280",
                fontSize: 13,
                marginTop: 6,
              }}
            >
              من الأقدم إلى الأحدث
            </div>
          </div>

          <span
            style={{
              color: "#9ca3af",
              background: "#111",
              padding:
                "7px 12px",
              borderRadius: 20,
            }}
          >
            {workDays?.length || 0}
            {" "}
            يوم
          </span>
        </div>

        {/* ==================================================
            NO DAYS
        ================================================== */}

        {!workDays ||
        workDays.length === 0 ? (
          <div
            style={{
              background: "#111",
              padding: 25,
              borderRadius: 10,
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            لا توجد أيام عمل مسجلة من
            {" "}
            01/01/2026
            {" "}
            حتى الآن.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {workDays.map(
              (
                day,
                index
              ) => {
                const todayDay =
                  isToday(
                    day.work_date
                  );

                const isOpen =
                  day.status ===
                  "open";

                return (
                  <div
                    key={day.id}
                    style={{
                      background:
                        todayDay
                          ? "#172554"
                          : "#111",
                      border:
                        todayDay
                          ? "1px solid #2563eb"
                          : "1px solid #333",
                      borderRadius: 12,
                      padding:
                        "15px 18px",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: 15,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    {/* ====================================
                        DATE
                    ==================================== */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          minWidth: 42,
                          borderRadius:
                            "50%",
                          background:
                            todayDay
                              ? "#2563eb"
                              : "#1e3a8a",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 8,
                            fontSize: 18,
                            fontWeight:
                              700,
                          }}
                        >
                          📅
                          {" "}
                          {formatDate(
                            day.work_date
                          )}

                          {todayDay && (
                            <span
                              style={{
                                background:
                                  "#2563eb",
                                color:
                                  "#fff",
                                padding:
                                  "3px 8px",
                                borderRadius:
                                  12,
                                fontSize: 11,
                              }}
                            >
                              اليوم
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            color:
                              "#9ca3af",
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          {day.work_date}
                        </div>
                      </div>
                    </div>

                    {/* ====================================
                        STATUS + ACTION
                    ==================================== */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          background:
                            isOpen
                              ? "#14532d"
                              : "#374151",
                          color:
                            isOpen
                              ? "#4ade80"
                              : "#d1d5db",
                          padding:
                            "6px 10px",
                          borderRadius:
                            20,
                          fontSize: 13,
                          fontWeight:
                            700,
                        }}
                      >
                        {isOpen
                          ? "🟢 مفتوح"
                          : "⚪ مغلق"}
                      </span>

                      <Link
                        href={`/admin/work-day/${day.id}`}
                        style={{
                          background:
                            todayDay
                              ? "#2563eb"
                              : "#374151",
                          color:
                            "#fff",
                          padding:
                            "10px 18px",
                          borderRadius:
                            8,
                          textDecoration:
                            "none",
                          fontWeight:
                            700,
                        }}
                      >
                        فتح اليوم →
                      </Link>

                      {!isOpen && (
                        <form
                          action={
                            openWorkDay
                          }
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={
                              day.id
                            }
                          />

                          <button
                            type="submit"
                            style={{
                              background:
                                "#16a34a",
                              color:
                                "#fff",
                              border:
                                "none",
                              padding:
                                "10px 18px",
                              borderRadius:
                                8,
                              cursor:
                                "pointer",
                              fontWeight:
                                700,
                            }}
                          >
                            🔓 فتح
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ==================================================
          BACK
      ================================================== */}

      <div
        style={{
          marginTop: 25,
        }}
      >
        <Link
          href="/admin/dashboard"
          style={{
            color: "#60a5fa",
            textDecoration:
              "none",
          }}
        >
          ← العودة للوحة التحكم
        </Link>
      </div>
    </main>
  );
}

