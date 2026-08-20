import Link from "next/link";

export default async function WorkDayApiPage({ params }) {
  const { id } = await params;

  return (
    <main style={pageStyle}>
      <h1>API Import</h1>
      <p style={textStyle}>
        This import method is not configured yet.
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
