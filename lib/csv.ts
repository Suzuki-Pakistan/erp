export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  if (rows.length < 2)
    throw new Error("Add a header row and at least one product.");
  const headers = rows[0].map((h) => h.replace(/^\uFEFF/, "").trim());
  if (new Set(headers).size !== headers.length)
    throw new Error("CSV headers must be unique.");
  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length)
      throw new Error(
        "Column count does not match on row " + (index + 2) + ".",
      );
    return Object.fromEntries(
      headers.map((header, i) => [header, values[i].trim()]),
    );
  });
}
export function downloadCsv(
  filename: string,
  rows: Record<string, string | number>[],
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const encode = (value: string | number) => {
    let text = String(value);
    if (/^[=+\-@\t\r]/.test(text) && typeof value === "string")
      text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const csv = [
    headers.map(encode).join(","),
    ...rows.map((row) => headers.map((h) => encode(row[h] ?? "")).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
