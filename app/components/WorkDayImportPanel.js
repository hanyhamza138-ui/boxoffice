"use client";

import { useRef, useState } from "react";

export default function WorkDayImportPanel() {
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState(null);
  const [text, setText] = useState("");

  const [fileName, setFileName] =
    useState("");

  const [message, setMessage] =
    useState("");

  const inputFile = (type) => {
    setMode(type);
    setMessage("");

    if (
      type === "excel" ||
      type === "pdf" ||
      type === "image"
    ) {
      fileInputRef.current?.click();
    }
  };

  const handleFile = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);

    setMessage(
      `تم اختيار الملف: ${file.name}`
    );
  };

  const handleText = () => {
    if (!text.trim()) {
      setMessage(
        "اكتب أو الصق رسالة التقرير أولاً."
      );
      return;
    }

    setMessage(
      "تم استلام الرسالة. سيتم تحليلها في الخطوة التالية."
    );
  };

  return (
    <section
      style={{
        marginBottom: 30,
        padding: 22,
        borderRadius: 16,
        background:
          "linear-gradient(135deg,#0b1220,#111827)",
        border: "1px solid #334155",
        boxShadow:
          "0 10px 30px rgba(0,0,0,.3)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: 18,
        }}
      >
        <div
          style={{
            color: "#FFD54A",
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 5,
          }}
        >
          📥 INPUT CENTER
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          مركز إدخال التقارير
        </h2>

        <p
          style={{
            margin:
              "7px 0 0",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          اختر طريقة إدخال تقرير الإيرادات.
          جميع الطرق ستتحول لاحقًا إلى نفس
          نظام المراجعة والحفظ.
        </p>
      </div>

      {/* INPUT OPTIONS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(145px,1fr))",
          gap: 10,
        }}
      >
        <InputCard
          icon="📝"
          title="إدخال يدوي"
          description="إدخال التقرير من الشاشة"
          onClick={() =>
            setMode("manual")
          }
          active={mode === "manual"}
        />

        <InputCard
          icon="📊"
          title="Excel"
          description="استيراد ملف Excel أو CSV"
          onClick={() =>
            inputFile("excel")
          }
          active={mode === "excel"}
        />

        <InputCard
          icon="📄"
          title="PDF"
          description="قراءة تقرير PDF"
          onClick={() =>
            inputFile("pdf")
          }
          active={mode === "pdf"}
        />

        <InputCard
          icon="🖼️"
          title="صورة"
          description="تحليل صورة التقرير"
          onClick={() =>
            inputFile("image")
          }
          active={mode === "image"}
        />

        <InputCard
          icon="💬"
          title="رسالة"
          description="لصق رسالة التقرير"
          onClick={() =>
            setMode("message")
          }
          active={mode === "message"}
        />
      </div>

      {/* HIDDEN FILE INPUT */}

      <input
        ref={fileInputRef}
        type="file"
        accept={
          mode === "excel"
            ? ".xlsx,.xls,.csv"
            : mode === "pdf"
              ? ".pdf"
              : "image/*"
        }
        onChange={handleFile}
        style={{
          display: "none",
        }}
      />

      {/* MESSAGE INPUT */}

      {mode === "message" && (
        <div
          style={{
            marginTop: 18,
            background: "#111",
            border: "1px solid #334155",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div
            style={{
              color: "#cbd5e1",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            💬 الصق رسالة التقرير
          </div>

          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder={
              "مثال:\nالتاريخ: 20/08/2026\nسينما: City Stars\nالفيلم: MOV001\nالتذاكر: 125\nالإيراد: 18500"
            }
            style={{
              width: "100%",
              minHeight: 150,
              boxSizing: "border-box",
              resize: "vertical",
              background: "#050505",
              color: "#fff",
              border:
                "1px solid #333",
              borderRadius: 10,
              padding: 12,
              fontFamily:
                "inherit",
              fontSize: 13,
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={handleText}
            style={{
              marginTop: 10,
              background:
                "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding:
                "10px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🔎 تحليل الرسالة
          </button>
        </div>
      )}

      {/* MANUAL */}

      {mode === "manual" && (
        <div
          style={{
            marginTop: 18,
            padding: 15,
            borderRadius: 10,
            background: "#111",
            border:
              "1px solid #334155",
            color: "#cbd5e1",
          }}
        >
          📝 الإدخال اليدوي سيستخدم صفحة يوم العمل
          الحالية، ولن يتم تغيير نظام الحفظ الموجود.
          <div
            style={{
              marginTop: 10,
            }}
          >
            افتح يوم العمل من القائمة بالأسفل
            ثم أدخل بيانات السينمات والأفلام.
          </div>
        </div>
      )}

      {/* FILE RESULT */}

      {fileName && (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 10,
            background: "#052e16",
            border:
              "1px solid #166534",
            color: "#86efac",
            fontSize: 13,
          }}
        >
          📎 {fileName}
        </div>
      )}

      {/* MESSAGE */}

      {message && (
        <div
          style={{
            marginTop: 12,
            padding: 11,
            borderRadius: 9,
            background: "#172554",
            border:
              "1px solid #1d4ed8",
            color: "#bfdbfe",
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {/* FLOW */}

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop:
            "1px solid #1e293b",
          color: "#64748b",
          fontSize: 11,
          lineHeight: 1.7,
        }}
      >
        <strong
          style={{
            color: "#94a3b8",
          }}
        >
          مسار الاستيراد:
        </strong>{" "}
        ملف / رسالة → قراءة → التعرف على السينما
        والفيلم → مراجعة البيانات → حفظ
        في boxoffice_reports
      </div>
    </section>
  );
}

/* =========================================================
   INPUT CARD
========================================================= */

function InputCard({
  icon,
  title,
  description,
  onClick,
  active,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "start",
        border: active
          ? "1px solid #FFD54A"
          : "1px solid #334155",

        background: active
          ? "linear-gradient(135deg,#29200a,#181818)"
          : "linear-gradient(135deg,#111827,#151515)",

        color: "#fff",
        borderRadius: 12,
        padding: 14,
        cursor: "pointer",
        minHeight: 100,
        transition:
          "transform .15s ease, border-color .15s ease",
      }}
    >
      <div
        style={{
          fontSize: 25,
          marginBottom: 7,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: 10,
          marginTop: 4,
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </button>
  );
}