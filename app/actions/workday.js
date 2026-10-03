"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

export async function saveWorkDayRevenue(data) {
  try {
    const { rows = [], deletedIds = [] } = JSON.parse(data);

    if (!rows.length && !deletedIds.length) {
      throw new Error("No data provided");
    }

    // ==========================================================
    // حذف السجلات التي حذفها المستخدم من الفورم
    // ==========================================================

    if (deletedIds.length) {
      const { error: deleteError } = await supabase
        .from("boxoffice_reports")
        .delete()
        .in(
          "id",
          deletedIds.map((id) => Number(id))
        );

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    const today = new Date()
      .toISOString()
      .split("T")[0];

    // ==========================================================
    // حفظ الأفلام التي لها بيانات فعلية فقط
    //
    // الفيلم يُحفظ إذا:
    // tickets > 0
    // أو
    // revenue > 0
    //
    // الفيلم الفارغ أو 0 / 0 لا يتم حفظه.
    // ==========================================================

    const payload = rows
      .filter((row) => {
        if (!row.movie_id || !row.cinema_id) {
          return false;
        }

        const tickets = Number(row.tickets || 0);
        const revenue = Number(row.revenue || 0);

        // لا تحفظ الفيلم إذا لا توجد له بيانات
        if (tickets <= 0 && revenue <= 0) {
          return false;
        }

        return true;
      })
      .map((row) => ({
        day_id: Number(row.day_id),
        cinema_id: Number(row.cinema_id),
        movie_id: Number(row.movie_id),

        version_id:
          row.version_id
            ? Number(row.version_id)
            : null,

        tickets: Number(row.tickets || 0),
        revenue: Number(row.revenue || 0),

        report_date: today,
        source: "manual",
      }));

    // ==========================================================
    // حفظ البيانات الفعلية
    // ==========================================================

    if (payload.length) {
      console.log(
        "REAL BOX OFFICE PAYLOAD:",
        payload
      );

      const { error } = await supabase
        .from("boxoffice_reports")
        .upsert(payload, {
          onConflict:
            "day_id,movie_id,cinema_id,version_id",
        });

      if (error) {
        console.log(error);
        throw new Error(error.message);
      }
    }

    // تحديث الصفحة الرئيسية وصفحات Work Day
    revalidatePath("/");
    revalidatePath("/admin/work-day");

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message:
        error?.message ||
        "Unknown error",
    };
  }
}

export async function deleteWorkDayReport(reportId) {
  try {
    const { error } = await supabase
      .from("boxoffice_reports")
      .delete()
      .eq("id", Number(reportId));

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin/work-day");

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message:
        error?.message ||
        "Unknown error",
    };
  }
}

export async function closeWorkDay(dayId) {
  try {
    const { error } = await supabase
      .from("boxoffice_days")
      .update({
        status: "closed",
      })
      .eq("id", Number(dayId));

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/admin/work-day/${dayId}`);
    revalidatePath("/admin/work-day");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.message ||
        "Unknown error",
    };
  }
}

export async function reopenWorkDay(dayId) {
  try {
    const { error } = await supabase
      .from("boxoffice_days")
      .update({
        status: "open",
      })
      .eq("id", Number(dayId));

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/admin/work-day/${dayId}`);
    revalidatePath("/admin/work-day");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.message ||
        "Unknown error",
    };
  }
}
