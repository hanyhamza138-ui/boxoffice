import { classifyDocument } from "./documentClassifier";
import { universalParser } from "./universalParser";
import { parseWhatsApp } from "./whatsappParser";
import { normalizeOCR } from "./ocrNormalizer";

/* =========================================================
   IMPORT PIPELINE
========================================================= */

export function runImportPipeline(document) {

  //----------------------------------
  // OCR Normalize
  //----------------------------------

  if (document.text) {

    document.text =
      normalizeOCR(
        document.text
      );

  }

  //----------------------------------
  // Classify
  //----------------------------------

  const classification =
    classifyDocument(document);

  //----------------------------------
  // Universal Text Parser
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
  // WhatsApp Parser
  //----------------------------------

  if (
    classification.type ===
    "whatsapp"
  ) {

    console.log(
      "Pipeline : WhatsApp"
    );

    const rows =
      parseWhatsApp(
        document.text
      );

    document.sheets = [

      {

        name: "WhatsApp",

        rows: rows.map(

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

  //----------------------------------
  // PDF
  //----------------------------------

  else if (
    classification.type ===
    "pdf"
  ) {

    console.log(
      "Pipeline : PDF"
    );

  }

  //----------------------------------
  // Image OCR
  //----------------------------------

  else if (
    classification.type ===
    "image"
  ) {

    console.log(
      "Pipeline : IMAGE OCR"
    );

  }

  //----------------------------------
  // Excel / CSV
  //----------------------------------

  else if (
    classification.type ===
    "excel"
  ) {

    console.log(
      "Pipeline : Excel"
    );

  }

  //----------------------------------
  // Unknown
  //----------------------------------

  else {

    console.log(
      "Pipeline : Unknown"
    );

  }

  //----------------------------------
  // Return
  //----------------------------------

  return {

    document,

    classification,

  };

}