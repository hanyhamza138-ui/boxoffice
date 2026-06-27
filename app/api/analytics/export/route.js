import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export async function POST(request) {

  try {


    const body =
      await request.json();


    const {
      fromDate,
      toDate,
      totals,
      movies,
      cinemas,
      daily,
    } = body;



    const {
      type
    } = Object.fromEntries(
      new URL(request.url)
      .searchParams
    );



    if(type === "excel"){


      const workbook =
        XLSX.utils.book_new();



      const dailySheet =
        XLSX.utils.json_to_sheet(
          daily || []
        );


      XLSX.utils.book_append_sheet(
        workbook,
        dailySheet,
        "Daily Revenue"
      );



      const moviesSheet =
        XLSX.utils.json_to_sheet(
          movies || []
        );


      XLSX.utils.book_append_sheet(
        workbook,
        moviesSheet,
        "Top Movies"
      );



      const cinemasSheet =
        XLSX.utils.json_to_sheet(
          cinemas || []
        );


      XLSX.utils.book_append_sheet(
        workbook,
        cinemasSheet,
        "Top Cinemas"
      );



      const buffer =
        XLSX.write(
          workbook,
          {
            type:"buffer",
            bookType:"xlsx",
          }
        );



      return new Response(
        buffer,
        {
          headers:{
            "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "Content-Disposition":
            `attachment; filename=analytics-${fromDate}-${toDate}.xlsx`,
          }
        }
      );


    }



    if(type === "pdf"){


      const doc =
        new jsPDF();



      doc.setFontSize(16);

      doc.text(
        "BoxOffice Analytics Report",
        14,
        20
      );


      doc.setFontSize(11);

      doc.text(
        `Period: ${fromDate} - ${toDate}`,
        14,
        30
      );



      doc.text(
        `Total Revenue: ${Number(totals?.revenue || 0).toLocaleString()}`,
        14,
        40
      );


      doc.text(
        `Total Audience: ${Number(totals?.audience || 0).toLocaleString()}`,
        14,
        50
      );



      autoTable(
        doc,
        {
          startY:60,

          head:[
            [
              "Date",
              "Revenue",
              "Audience"
            ]
          ],

          body:
          (daily || [])
          .map(item=>[
            item.date,
            item.revenue,
            item.audience,
          ])
        }
      );



      const pdf =
        doc.output("arraybuffer");



      return new Response(
        pdf,
        {
          headers:{
            "Content-Type":
            "application/pdf",

            "Content-Disposition":
            `attachment; filename=analytics-${fromDate}-${toDate}.pdf`,
          }
        }
      );

    }



    return NextResponse.json(
      {
        error:"Invalid export type"
      },
      {
        status:400
      }
    );



  } catch(error){


    console.log(
      "EXPORT ERROR",
      error
    );


    return NextResponse.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );

  }

}