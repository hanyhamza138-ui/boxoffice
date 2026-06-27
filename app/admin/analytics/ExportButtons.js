"use client";

export default function ExportButtons({
  fromDate,
  toDate,
  totals,
  movies,
  cinemas,
  daily,
}) {


  async function exportReport(type) {

    const response =
      await fetch(
        `/api/analytics/export?type=${type}`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({
            fromDate,
            toDate,
            totals,
            movies,
            cinemas,
            daily,
          }),
        }
      );


    const blob =
      await response.blob();


    const url =
      window.URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;


    link.download =
      type === "excel"
      ? "analytics-report.xlsx"
      : "analytics-report.pdf";


    document.body.appendChild(link);


    link.click();


    link.remove();


    window.URL.revokeObjectURL(url);

  }



  return (

    <div
      style={{
        display:"flex",
        gap:15,
        marginTop:25,
        marginBottom:25,
      }}
    >

      <button
        onClick={()=>exportReport("excel")}
        style={{
          background:"#166534",
          color:"white",
          padding:"12px 20px",
          borderRadius:8,
          border:"none",
          cursor:"pointer",
          fontWeight:800,
        }}
      >
        📊 Export Excel
      </button>


      <button
        onClick={()=>exportReport("pdf")}
        style={{
          background:"#991b1b",
          color:"white",
          padding:"12px 20px",
          borderRadius:8,
          border:"none",
          cursor:"pointer",
          fontWeight:800,
        }}
      >
        📄 Export PDF
      </button>


    </div>

  );

}