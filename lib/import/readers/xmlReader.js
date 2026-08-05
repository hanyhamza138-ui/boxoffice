export async function xmlReader(file) {

  const text =
    await file.text();

  const parser =
    new DOMParser();

  const xml =
    parser.parseFromString(
      text,
      "application/xml"
    );

  const rows = [];

  xml.querySelectorAll("*").forEach(node => {

    if (
      node.children.length === 0 &&
      node.textContent.trim()
    ) {

      rows.push({

        field:
          node.nodeName,

        value:
          node.textContent.trim(),

      });

    }

  });

  return {

    type: "xml",

    text,

    xml,

    sheets: [

      {

        name: "XML",

        rows,

      },

    ],

  };

}