import XLSX from 'xlsx';

export function readTDataSheets(workbook) {
  const resultArray = [];
  const skipSheets = new Set([
    'General',
    'General2',
    'Menu and Activities',
  ]);
  // Duyệt qua tất cả các tên sheet trong workbook
  for (const sheetName of workbook.SheetNames) {
    if (skipSheets.has(sheetName)) continue;

    // if (/^T\d+$/.test(sheetName)) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const range = XLSX.utils.decode_range(sheet['!ref']);

      // Đọc Pax_Account
      const paxAccounts = [];
      for (let r = 2; r <= range.e.r + 1; r++) {
        const cell = sheet[XLSX.utils.encode_cell({ c: 1, r: r - 1 })];
        if (!cell || cell.v === undefined || cell.v === null || String(cell.v).trim() === '') break;
        paxAccounts.push(cell.v);
      }

      // Đọc TimeTable
      const timeTable = {};
      for (let r = 2; r <= range.e.r + 1; r++) {
        const keyCell = sheet[XLSX.utils.encode_cell({ c: 3, r: r - 1 })];
        if (!keyCell || keyCell.v === undefined || keyCell.v === null || String(keyCell.v).trim() === '') break;
        const key = keyCell.w ?? keyCell.v;

        const rowArr = [];
        for (let c = 4; c <= range.e.c; c++) {
          const cell = sheet[XLSX.utils.encode_cell({ c, r: r - 1 })];
          rowArr.push(cell ? cell.v : null);
        }
        timeTable[key] = rowArr;
      }

      const share_password = sheet['C5']?.v ?? null;
      const Tour_Guide = sheet['C8']?.v ?? null;
      const Tour_Name = sheet['C2']?.v ?? null;

      // Thêm object vào kết quả
      resultArray.push({
        "Tour_Name": Tour_Name,
        "Pax_Account": paxAccounts,
        "SharePassword": share_password,
        "TimeTable": timeTable,
        "Tour_Guide": Tour_Guide,
      });
    // }
  }

  return resultArray;
}

// const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');
// // Ví dụ sử dụng:
// try {
//   const data = readT1Data(workbook);
//   console.log(JSON.stringify(data, null, 2));
// } catch (err) {
//   console.error(err.message);
// }

// module.exports = { readT1Data };
