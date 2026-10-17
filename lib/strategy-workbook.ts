import ExcelJS from "exceljs";
import type { Project } from "./domain";
import { strategyTables, type StrategyTable } from "./strategy-tables";
export function appendStrategyTables(
  book: ExcelJS.Workbook,
  project: Project,
  snapshot?: StrategyTable[],
) {
  for (const table of snapshot || strategyTables(project))
    writeTable(book, table);
}
function writeTable(book: ExcelJS.Workbook, table: StrategyTable) {
  const sheet = book.addWorksheet(table.title, {
    properties: { tabColor: { argb: "FF134A9B" } },
    views: [{ state: "frozen", xSplit: 1, ySplit: 3 }],
    pageSetup: {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });
  sheet.mergeCells(1, 1, 1, table.headers.length);
  sheet.getCell(1, 1).value = table.title;
  sheet.getRow(1).height = 30;
  sheet.getCell(1, 1).font = {
    name: "Arial",
    size: 15,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell(1, 1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF134A9B" },
  };
  sheet.mergeCells(2, 1, 2, table.headers.length);
  sheet.getCell(2, 1).value = table.note;
  sheet.getCell(2, 1).font = {
    name: "Arial",
    size: 10,
    italic: true,
    color: { argb: "FF58708F" },
  };
  sheet.getCell(2, 1).alignment = { wrapText: true, vertical: "middle" };
  sheet.getRow(2).height = 52;
  sheet.addRow(table.headers);
  sheet.addRows(table.rows);
  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: table.headers.length },
  };
  sheet.pageSetup.printTitlesRow = "1:3";
  sheet.columns.forEach((column, index) => {
    column.width = index === 0 ? 27 : table.headers.length <= 5 ? 43 : 31;
  });
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < 3) return;
    let lines = 1;
    row.eachCell((cell, column) => {
      cell.font = {
        name: "Arial",
        size: 11,
        bold: rowNumber === 3,
        color: { argb: rowNumber === 3 ? "FFFFFFFF" : "FF29415F" },
      };
      cell.alignment = { wrapText: true, vertical: "top" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb:
            rowNumber === 3
              ? "FF1C658F"
              : rowNumber % 2 === 0
                ? "FFF0F6FC"
                : "FFFFFFFF",
        },
      };
      cell.border = { bottom: { style: "hair", color: { argb: "FFDCE7F2" } } };
      const text = cell.value === null ? "" : String(cell.value);
      lines = Math.max(
        lines,
        ...text
          .split("\n")
          .map((part) =>
            Math.ceil(
              part.length /
                (column === 1 ? 24 : table.headers.length <= 5 ? 37 : 27),
            ),
          ),
      );
      if (/^https:\/\//.test(text)) {
        cell.value = { text, hyperlink: text };
        cell.font = {
          name: "Arial",
          size: 10,
          color: { argb: "FF134A9B" },
          underline: true,
        };
      }
    });
    row.height = Math.min(
      400,
      Math.max(rowNumber === 3 ? 42 : 32, lines * 17 + 14),
    );
  });
}
export function createStrategyWorkbook(project: Project) {
  const book = new ExcelJS.Workbook();
  book.creator = "Medical Marketing Intelligence";
  appendStrategyTables(book, project);
  return book;
}
