import { describe, expect, it } from "vitest";
import authored from "../content/challenges.json";
import modules from "../content/modules.json";
import { challengesToRows, parseCSV, rowsToChallenges, toCSV } from "../scripts/content-csv.mjs";

describe("content CSV", () => {
  it("round-trips the whole question bank losslessly", () => {
    const csv = toCSV(challengesToRows(authored, modules));
    expect(rowsToChallenges(parseCSV(csv), modules)).toEqual(authored);
  });

  it("handles quotes, commas, semicolons and line breaks inside cells", () => {
    const rows = [["a", 'dijo "hola", luego; salió', "línea 1\nlínea 2"]];
    expect(parseCSV(toCSV(rows))).toEqual(rows);
  });

  it("ignores a UTF-8 BOM and CRLF line endings from Excel", () => {
    expect(parseCSV("﻿a,b\r\nc,d\r\n")).toEqual([["a", "b"], ["c", "d"]]);
  });

  it("rejects a sheet with unexpected headers", () => {
    expect(() => rowsToChallenges([["id", "otra"]], modules)).toThrow(/Encabezados/);
  });
});
