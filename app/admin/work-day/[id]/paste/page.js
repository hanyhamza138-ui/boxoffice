import Link from "next/link";

export default async function WorkDayPastePage({ params }) {
  const { id } = await params;

  return (
    <main style={pageStyle}>
      <h1>Paste Import</h1>
      <p style={textStyle}>
        Paste import is not configured yet. Use manual entry or Excel import.
      </p>
      <Link href={`/admin/work-day/${id}`} style={linkStyle}>
        Back to work day
      </Link>
    </main>
  );
}

const pageStyle = {
  color: "white",
  padding: 30,
};

const textStyle = {
  color: "#9ca3af",
};

const linkStyle = {
  color: "#facc15",
  fontWeight: 700,
};
