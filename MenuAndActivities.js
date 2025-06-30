import XLSX from 'xlsx';

export function readMenuAndActivitiesData(workbook) {
  const sheet = workbook.Sheets['Menu and Activities'];
  if (!sheet) {
    throw new Error('Sheet "Menu and Activities" not found');
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);
  const result = {};

  for (let startCol = range.s.c; startCol <= range.e.c; startCol += 4) {
    let tableKey = null;

    // Tìm dòng đầu tiên trong cột startCol chứa giá trị string và không phải "STT"
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: startCol });
      const cell = sheet[cellAddr];
      if (cell && cell.t === 's' && cell.v.trim().toLowerCase() !== 'stt') {
        tableKey = cell.v.trim();
        break;
      }
    }

    // Nếu không tìm được key hợp lệ => kết thúc
    if (!tableKey) {
      break;
    }

    // const values = [];
    let values = 0

    for (let row = range.s.r; row <= range.e.r; row++) {
      const col1Addr = XLSX.utils.encode_cell({ r: row, c: startCol });
      const col3Addr = XLSX.utils.encode_cell({ r: row, c: startCol + 2 });

      const c1 = sheet[col1Addr];
      const c3 = sheet[col3Addr];

      // console.log("c3.v: ", c3.v)
      if (c1 && c1.t === 's' && c1.v.trim() && c3 && c3.t === 'n') {
        // values.push(c3.v);
        values += c3.v 
      }
    }
    result[tableKey] = values;
  }

  return result;
}

// const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');

// // Example usage:
// try {
//   const data = readMenuAndActivitiesData(workbook);
//   console.log(JSON.stringify(data, null, 2));
// } catch (err) {
//   console.error(err);
// }
