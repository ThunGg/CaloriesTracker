import XLSX from 'xlsx';

function findFarthestMoreThanLast(A) {
  const n = A.length;
  if (n < 2) return null;
  let maxDist = 0;
  let result = { value: null, index: null };
  for (let i = 0; i < n - 1; i++) {
    if (A[i] > A[n - 1]) {
      const dist = Math.abs(A[i] - A[n - 1]);
      if (dist > maxDist) {
        maxDist = dist;
        // result = { value: A[i], index: i+1 };
        result['value'] = maxDist
        result['index'] = i+1
      }
    }
  }
  return result;
}

function calculateSum(arr) {
  // Lọc bỏ các phần tử null
  const validNumbers = arr.filter(val => val !== null);
  if (validNumbers.length === 0) return 0; // Không có phần tử hợp lệ
  const sum = validNumbers.reduce((acc, val) => acc + val, 0);
  const mean = sum / validNumbers.length;
  return mean;
}


export function readGeneralData(workbook) {
  // const XLSX = require('xlsx');
  // 1. Đọc file và lấy sheet “General”
  // const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');
  const sheet = workbook.Sheets['General'];
  if (!sheet) throw new Error('Sheet "General" không tồn tại');

  // 2. Decode vùng dữ liệu để biết số dòng tối đa
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const maxRow = range.e.r + 1;

  // 3. Hàm tìm start/end row cho 1 cột Month
  function findStartEnd(colLetter) {
    let start = null, end = null;
    for (let r = 1; r <= maxRow; r++) {
      const cell = sheet[`${colLetter}${r}`];
      if (cell && cell.v === 'January' && start === null) {
        start = r;
      }
      if (cell && cell.v === 'December') {
        end = r;
      }
    }
    if (start === null || end === null || end < start) {
      throw new Error(`Không tìm thấy đầy đủ January→December ở cột ${colLetter}`);
    }
    return { start, end };
  }

  // 4. Tìm khung dữ liệu cho mỗi bảng:
  const carbonFrame  = findStartEnd('B'); // cột B chứa Month cho Carbon
  const plasticFrame = findStartEnd('E'); // cột E chứa Month cho Plastic
  const wasteFrame   = findStartEnd('H'); // cột H chứa Month cho Waste

  // 5. Đọc giá trị vào mảng
  const carbon  = [];
  const plastic = [];
  const waste   = [];

  // Carbon: Month ở B, giá trị ở C
  for (let r = carbonFrame.start; r <= carbonFrame.end; r++) {
    const cell = sheet[`C${r}`];
    carbon.push(cell ? Math.abs(cell.v) : null);
  }

  // Plastic bottle %: Month ở E, giá trị ở F
  for (let r = plasticFrame.start; r <= plasticFrame.end; r++) {
    const cell = sheet[`F${r}`];
    plastic.push(cell ? cell.v : null);
  }

  // Food waste: Month ở H, giá trị ở I
  for (let r = wasteFrame.start; r <= wasteFrame.end; r++) {
    const cI = sheet[`I${r}`];
    const cJ = sheet[`J${r}`];
    const vI = cI ? +cI.v : null;
    const vJ = cJ ? +cJ.v : null;
    if (vI !== null && vJ !== null && vI !== 0) {
      waste.push(vJ / vI);
    }
    // waste.push(cell ? cell.v : null);
  }

  // console.log('Col1 =', calculateMean(carbon))
  // console.log('Col2 =',findFarthestMoreThanLast(plastic))
  // console.log('Col3 =',findFarthestMoreThanLast(waste))
  // findFarthestLessThanLast(plastic)
  // findFarthestLessThanLast(waste)

  // console.log('Carbon in origin =', carbon)

  let General1_carbon = calculateSum(carbon)
  let General1_plastic = findFarthestMoreThanLast(plastic)
  General1_plastic.value = General1_plastic.value*100
  let General1_waste = findFarthestMoreThanLast(waste)
  General1_waste.value = General1_waste.value*1000

  // Lấy giá trị ô P4
  const plastic_bottle_Path = sheet['Q4']?.v ?? null;
  return {General1_carbon, carbon, General1_plastic, General1_waste, plastic_bottle_Path,};
}

// const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');

// try {
  // const { carbon, plastic, waste, plastic_bottle_Path } = readGeneralData(workbook);
  // console.log('Carbon Footprint:', carbon);
  // console.log('Plastic Bottle %:', plastic);
  // console.log('Food Waste:', waste);
  // console.log('plastic_bottle_Path:', plastic_bottle_Path)
// } catch (error) {
  // console.error('Lỗi đọc file:', error.message);
// }
