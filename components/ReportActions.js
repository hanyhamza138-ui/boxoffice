"use client";

export default function ReportActions({
  day,
  totals,
  movies,
}) {

  function shareWhatsApp() {

    let text = "";

    text +=
      "🎬 تقرير يوم العمل\n";

    text +=
      "📅 " +
      day +
      "\n\n";

    text +=
      "💰 إجمالي الإيراد: " +
      Number(
        totals.revenue || 0
      ).toLocaleString() +
      " جنيه\n";

    text +=
      "🎟️ إجمالي الرواد: " +
      Number(
        totals.tickets || 0
      ).toLocaleString() +
      "\n";

    text +=
      "🏢 عدد السينمات: " +
      Number(
        totals.cinemas || 0
      ) +
      "\n\n";

    text +=
      "━━━━━━━━━━━━━━\n\n";
          movies.forEach(
      (movie, index) => {

        const medal =
          index === 0
            ? "🥇"
            : index === 1
            ? "🥈"
            : index === 2
            ? "🥉"
            : (index + 1) + "️⃣";

        text +=
          medal +
          " " +
          movie.title +
          "\n";

        text +=
          "💰 الإيراد: " +
          Number(
            movie.revenue || 0
          ).toLocaleString() +
          " جنيه\n";

        text +=
          "🎟️ الرواد: " +
          Number(
            movie.tickets || 0
          ).toLocaleString() +
          "\n";

        text +=
          "🏢 السينمات: " +
          Number(
            movie.cinemas_count || 0
          ) +
          "\n\n";

      }
    );

    const url =
      "https://wa.me/?text=" +
      encodeURIComponent(text);

    window.open(
      url,
      "_blank"
    );
  }
    return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() => window.print()}
        style={buttonStyle}
      >
        🖨️ طباعة
      </button>

      <button
        type="button"
        disabled
        style={disabledButtonStyle}
      >
        📄 PDF
      </button>

      <button
        type="button"
        disabled
        style={disabledButtonStyle}
      >
        📊 Excel
      </button>

      <button
        type="button"
        onClick={shareWhatsApp}
        style={{
          ...buttonStyle,
          background: "#16a34a",
        }}
      >
        🟢 WhatsApp
      </button>
    </div>
  );
}

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const disabledButtonStyle = {
  background: "#444",
  color: "#bbb",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "not-allowed",
};