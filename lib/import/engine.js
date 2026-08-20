/* =====================================================
   BOXOFFICE IMPORT ENGINE
   ===================================================== */

/* =====================================================
   Helpers
===================================================== */

function extension(file) {
  if (!file?.name) {
    throw new Error("Invalid file.");
  }

  return file.name
    .split(".")
    .pop()
    .toLowerCase();
}

function safeString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

/* =====================================================
   Dynamic Readers
   مهم جدًا:
   لا نعمل import للـ PDF عند تحميل Engine.
   يتم تحميل القارئ فقط عند الحاجة.
===================================================== */

async function read(file) {
  const ext = extension(file);

  switch (ext) {
    /* -----------------------------------------------
       Excel
    ----------------------------------------------- */

    case "xlsx":
    case "xls": {
      const module =
        await import("./readers/excelReader");

      return await module.excelReader(file);
    }

    /* -----------------------------------------------
       CSV
    ----------------------------------------------- */

    case "csv": {
      const module =
        await import("./readers/csvReader");

      return await module.csvReader(file);
    }

    /* -----------------------------------------------
       PDF
       يتم تحميله فقط إذا الملف PDF
    ----------------------------------------------- */

    case "pdf": {
      const module =
        await import("./readers/pdfReader");

      return await module.pdfReader(file);
    }

    /* -----------------------------------------------
       Images
    ----------------------------------------------- */

    case "png":
    case "jpg":
    case "jpeg":
    case "webp": {
      const module =
        await import("./readers/imageReader");

      return await module.imageReader(file);
    }

    /* -----------------------------------------------
       TXT
    ----------------------------------------------- */

    case "txt": {
      const module =
        await import("./readers/textReader");

      return await module.textReader(file);
    }

    /* -----------------------------------------------
       DOCX
    ----------------------------------------------- */

    case "docx": {
      const module =
        await import("./readers/docxReader");

      return await module.docxReader(file);
    }

    /* -----------------------------------------------
       JSON
    ----------------------------------------------- */

    case "json": {
      const module =
        await import("./readers/jsonReader");

      return await module.jsonReader(file);
    }

    /* -----------------------------------------------
       XML
    ----------------------------------------------- */

    case "xml": {
      const module =
        await import("./readers/xmlReader");

      return await module.xmlReader(file);
    }

    default:
      throw new Error(
        `Unsupported file type: ${ext}`
      );
  }
}

/* =====================================================
   Dynamic Core Modules
===================================================== */

async function loadParserModules() {
  const [
    parserModule,
    pipelineModule,
    aiModule,
    confidenceModule,
    validatorModule,
    movieMatcherModule,
    cinemaMatcherModule,
    versionMatcherModule,
  ] = await Promise.all([
    import("./smartParser"),
    import("./ai/importPipeline"),
    import("./ai/importAI"),
    import("./ai/confidenceEngine"),
    import("./validator/validator"),
    import("./matcher/movieMatcher"),
    import("./matcher/cinemaMatcher"),
    import("./matcher/versionMatcher"),
  ]);

  return {
    smartParser:
      parserModule.smartParser,

    normalizeImportRows:
      parserModule.normalizeImportRows,

    runImportPipeline:
      pipelineModule.runImportPipeline,

    analyzeDocument:
      aiModule.analyzeDocument,

    calculateConfidence:
      confidenceModule.calculateConfidence,

    validateRows:
      validatorModule.validateRows,

    matchMovie:
      movieMatcherModule.matchMovie,

    matchCinema:
      cinemaMatcherModule.matchCinema,

    matchVersion:
      versionMatcherModule.matchVersion,
  };
}

/* =====================================================
   Import Engine
===================================================== */

export async function importEngine(file) {
  /* -----------------------------------------------
     Validate
  ----------------------------------------------- */

  if (!file) {
    throw new Error("No file selected.");
  }

  if (!file.name) {
    throw new Error("Invalid file.");
  }

  const fileExtension =
    extension(file);

  console.log(
    "===================================="
  );

  console.log(
    "📥 BOXOFFICE IMPORT ENGINE"
  );

  console.log(
    "FILE:",
    file.name
  );

  console.log(
    "TYPE:",
    fileExtension
  );

  console.log(
    "===================================="
  );

  /* -----------------------------------------------
     Read File
  ----------------------------------------------- */

  let rawDocument;

  try {
    rawDocument =
      await read(file);
  } catch (error) {
    console.error(
      "❌ Reader Error:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to read document."
    );
  }

  if (!rawDocument) {
    throw new Error(
      "Unable to read document."
    );
  }

  console.log(
    "📄 RAW DOCUMENT:",
    rawDocument
  );

  /* -----------------------------------------------
     Load Parser / Matching Modules
  ----------------------------------------------- */

  const {
    smartParser,
    normalizeImportRows,
    runImportPipeline,
    analyzeDocument,
    calculateConfidence,
    validateRows,
    matchMovie,
    matchCinema,
    matchVersion,
  } =
    await loadParserModules();

  /* -----------------------------------------------
     Import Pipeline
  ----------------------------------------------- */

  let pipelineResult = null;

  try {
    pipelineResult =
      await runImportPipeline(
        rawDocument
      );
  } catch (error) {
    console.error(
      "⚠️ Import Pipeline Error:",
      error
    );

    /*
      لا نوقف الاستيراد بالكامل.
      نستخدم المستند الأصلي.
    */

    pipelineResult = {
      document:
        rawDocument,

      classification:
        null,
    };
  }

  const document =
    pipelineResult?.document ||
    rawDocument;

  const classification =
    pipelineResult?.classification ||
    null;

  /* -----------------------------------------------
     AI Analyze
  ----------------------------------------------- */

  let ai = null;

  try {
    ai =
      await analyzeDocument(
        document
      );

    console.log(
      "🤖 AI SCORE:",
      ai
    );
  } catch (error) {
    console.error(
      "⚠️ AI Analyze Error:",
      error
    );
  }

  /* -----------------------------------------------
     Smart Parse
  ----------------------------------------------- */

  let parsed;

  try {
    parsed =
      await smartParser(
        document
      );
  } catch (error) {
    console.error(
      "❌ Smart Parser Error:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to parse document."
    );
  }

  console.log(
    "🧠 PARSED:",
    parsed
  );

  /* -----------------------------------------------
     Validate
  ----------------------------------------------- */

  let validatedRows = [];

  try {
    validatedRows =
      validateRows(
        parsed?.rows || []
      );
  } catch (error) {
    console.error(
      "⚠️ Validation Error:",
      error
    );

    validatedRows =
      parsed?.rows || [];
  }

  const rows =
    normalizeImportRows(
      validatedRows || []
    );

  console.log(
    "📊 NORMALIZED ROWS:",
    rows.length
  );

  /* -----------------------------------------------
     Matching
  ----------------------------------------------- */

  const result = [];

  for (
    const originalRow of rows
  ) {
    const row = {
      ...originalRow,

      cinema:
        safeString(
          originalRow?.cinema
        ),

      movie:
        safeString(
          originalRow?.movie
        ),

      version:
        safeString(
          originalRow?.version
        ),

      tickets:
        originalRow?.tickets ??
        "",

      revenue:
        originalRow?.revenue ??
        "",
    };

    /* ---------------------------------------------
       Result Item
    --------------------------------------------- */

    const item = {
      ...row,

      movieId: null,
      movieName: "",
      movieScore: 0,
      movieMethod: "",

      cinemaId: null,
      cinemaName: "",
      cinemaScore: 0,
      cinemaMethod: "",

      versionId: null,
      versionName: "",
      versionScore: 0,
      versionMethod: "",

      matchedMovie: false,
      matchedCinema: false,

      /*
        عدم وجود Version ليس خطأ.
        ولذلك نعتبره matched من البداية.
      */

      matchedVersion: false,
    };

    /* ---------------------------------------------
       Movie Match
    --------------------------------------------- */

    if (row.movie) {
      try {
        const movie =
          await matchMovie(
            row.movie
          );

        if (
          movie &&
          movie.item &&
          movie.item.id
        ) {
          item.movieId =
            movie.item.id;

          item.movieName =
            movie.item.title ||
            row.movie;

          item.movieScore =
            movie.score ?? 0;

          item.movieMethod =
            movie.method || "";

          item.matchedMovie =
            true;
        } else {
          console.log(
            "❌ Movie Not Found:",
            row.movie
          );
        }
      } catch (error) {
        console.error(
          "❌ Movie Match Error:",
          row.movie,
          error
        );
      }
    }

    /* ---------------------------------------------
       Cinema Match
    --------------------------------------------- */

    if (row.cinema) {
      try {
        const cinema =
          await matchCinema(
            row.cinema
          );

        if (
          cinema &&
          cinema.item &&
          cinema.item.id
        ) {
          item.cinemaId =
            cinema.item.id;

          item.cinemaName =
            cinema.item.name ||
            row.cinema;

          item.cinemaScore =
            cinema.score ?? 0;

          item.cinemaMethod =
            cinema.method || "";

          item.matchedCinema =
            true;
        } else {
          console.log(
            "❌ Cinema Not Found:",
            row.cinema
          );
        }
      } catch (error) {
        console.error(
          "❌ Cinema Match Error:",
          row.cinema,
          error
        );
      }
    }

    /* ---------------------------------------------
       Version Match
    --------------------------------------------- */

    const versionText =
      safeString(
        row.version
      );

    const invalidVersion =
      !versionText ||
      /^[-–—_\s]+$/.test(
        versionText
      ) ||
      versionText.length < 2;

    /*
      لو Version غير موجودة:
      هذا الصف صالح.
    */

    if (invalidVersion) {
      item.versionId =
        null;

      item.versionName =
        "";

      item.versionScore =
        0;

      item.versionMethod =
        "none";

      item.matchedVersion =
        true;
    } else {
      try {
        const version =
          await matchVersion(
            versionText
          );

        if (
          version &&
          version.item &&
          version.item.id
        ) {
          item.versionId =
            version.item.id;

          item.versionName =
            version.item.name ||
            versionText;

          item.versionScore =
            version.score ?? 0;

          item.versionMethod =
            version.method || "";

          item.matchedVersion =
            true;
        } else {
          console.log(
            "⚠️ Version Not Found:",
            versionText
          );

          /*
            Version موجودة في الملف
            ولكن لم نجدها في DB.

            لا نربطها خطأ.
            لكن لا نحذف الصف.
          */

          item.versionId =
            null;

          item.versionName =
            versionText;

          item.versionScore =
            0;

          item.versionMethod =
            "unmatched";

          /*
            مهم:
            السماح بحفظ الصف حتى لو
            النسخة غير موجودة.
          */

          item.matchedVersion =
            true;
        }
      } catch (error) {
        console.error(
          "❌ Version Match Error:",
          versionText,
          error
        );

        /*
          لا نوقف الاستيراد بسبب Version.
        */

        item.versionId =
          null;

        item.versionName =
          versionText;

        item.versionScore =
          0;

        item.versionMethod =
          "error";

        item.matchedVersion =
          true;
      }
    }

    /* ---------------------------------------------
       Debug Row
    --------------------------------------------- */

    console.log(
      "IMPORT ROW:",
      {
        cinema:
          item.cinema,

        movie:
          item.movie,

        version:
          item.version,

        tickets:
          item.tickets,

        revenue:
          item.revenue,

        movieId:
          item.movieId,

        cinemaId:
          item.cinemaId,

        versionId:
          item.versionId,

        matchedMovie:
          item.matchedMovie,

        matchedCinema:
          item.matchedCinema,

        matchedVersion:
          item.matchedVersion,
      }
    );

    result.push(item);
  }

  /* -----------------------------------------------
     Confidence
  ----------------------------------------------- */

  let confidence = null;

  try {
    confidence =
      calculateConfidence({
        rows: result,
      });
  } catch (error) {
    console.error(
      "⚠️ Confidence Error:",
      error
    );
  }

  /* -----------------------------------------------
     Statistics
  ----------------------------------------------- */

  const matchedRows =
    result.filter(
      (row) =>
        row.matchedMovie &&
        row.matchedCinema
    ).length;

  const unmatchedRows =
    result.filter(
      (row) =>
        !row.matchedMovie ||
        !row.matchedCinema
    ).length;

  /* -----------------------------------------------
     Totals
     مهم للمراجعة قبل الحفظ
  ----------------------------------------------- */

  const totalTickets =
    result.reduce(
      (sum, row) =>
        sum +
        (
          Number(
            row.tickets
          ) || 0
        ),
      0
    );

  const totalRevenue =
    result.reduce(
      (sum, row) =>
        sum +
        (
          Number(
            row.revenue
          ) || 0
        ),
      0
    );

  console.log(
    "===================================="
  );

  console.log(
    "📊 IMPORT FINAL SUMMARY"
  );

  console.log(
    "Total Rows:",
    result.length
  );

  console.log(
    "Matched Rows:",
    matchedRows
  );

  console.log(
    "Unmatched Rows:",
    unmatchedRows
  );

  console.log(
    "Total Tickets:",
    totalTickets
  );

  console.log(
    "Total Revenue:",
    totalRevenue
  );

  console.log(
    "===================================="
  );

  /* -----------------------------------------------
     Return
  ----------------------------------------------- */

  return {
    ai,

    classification,

    reportDate:
      parsed?.reportDate ||
      "",

    confidence,

    totalRows:
      result.length,

    matchedRows,

    unmatchedRows,

    totalTickets,

    totalRevenue,

    rows: result,
  };
}

/* =====================================================
   Default Export
===================================================== */

export default importEngine;