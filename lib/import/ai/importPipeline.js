import { classifyDocument } from "./documentClassifier";
import { universalParser } from "./universalParser";
import { parseWhatsApp } from "./whatsappParser";
/* =========================================================
   IMPORT PIPELINE
========================================================= */

export function runImportPipeline(document) {

  //----------------------------------
  // Classify
  //----------------------------------

  const classification =
    classifyDocument(document);

  //----------------------------------
  // Universal Text
  //----------------------------------

  if (
    document.text &&
    !document.sheets
  ) {

    document.sheets = [

      {

        name: "Universal",

        rows:
          universalParser(
            document.text
          ),

      },

    ];

  }

  //----------------------------------
  // PDF
  //----------------------------------

  if (
    classification.type ===
    "pdf"
  ) {

    console.log(
      "Pipeline : PDF"
    );

  }

  //----------------------------------
  // WhatsApp
  //----------------------------------

  if (
  classification.type ===
  "whatsapp"
) {

  document.sheets = [

    {

      name: "WhatsApp",

      rows:
        parseWhatsApp(
          document.text
        ).map(

          row => [

            row.cinema,

            row.movie,

            row.version,

            row.tickets,

            row.revenue,

          ]

        ),

    },

  ];

}

    console.log(
      "Pipeline : WhatsApp"
    );

  }

  //----------------------------------
  // Image
  //----------------------------------

  if (
    classification.type ===
    "image"
  ) {

    console.log(
      "Pipeline : OCR"
    );

  }

  //----------------------------------
  // Excel
  //----------------------------------

  if (
    classification.type ===
    "excel"
  ) {

    console.log(
      "Pipeline : Excel"
    );

  }

  return {

    document,

    classification,

  };
