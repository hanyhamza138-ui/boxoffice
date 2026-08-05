export async function jsonReader(file) {

  const text =
    await file.text();

  const json =
    JSON.parse(text);

  let rows = [];

  if (Array.isArray(json)) {

    rows = json;

  } else if (Array.isArray(json.data)) {

    rows = json.data;

  } else {

    rows = [json];

  }

  return {

    type: "json",

    text,

    sheets: [

      {

        name: "JSON",

        rows,

      },

    ],

  };

}