import XLSX from 'xlsx';

export function readGeneral2Data(workbook, selectSerial) {
  // Get the "General2" sheet
  const sheet = workbook.Sheets['General2'];
  if (!sheet) {
    throw new Error('Sheet "General2" not found in workbook');
  }

  // Convert sheet to a 2D array (rows of arrays)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Find the index of the "January" and "December" rows
  // const startIdx = rows.findIndex(r => r[0] === 'January');
  // const startIdx = 3;
  // const endIdx = rows.findIndex(r => r[0] === 'December');
  const column0Count = rows.filter(row => row[0] != null && row[0] !== '').length;
  console.log('column0Count =',column0Count)
  let selectTime =-1;
  for (let r = 2; r <= column0Count + 1; r++) {
    const cell = sheet[XLSX.utils.encode_cell({ c: 0, r: r })];
    console.log('cell =', cell)
    if (!cell || cell.v === undefined || cell.v === null || String(cell.v).trim() === '') break;
    const cellDate = new Date((cell.v - 25569) * 86400 * 1000);
    if (cellDate.getFullYear() === selectSerial.getFullYear() && cellDate.getMonth() === selectSerial.getMonth()) selectTime = r-1;
    // if cell.v === 
    console.log('selectTime=', selectTime)
    // v_Month = new Date(year, month)
  }
  console.log('*selectTime=', selectTime)
  // if (startIdx === -1 || endIdx === -1) {
  //   throw new Error('Could not find January and/or December rows');
  // }
  // console.log(rows)
  let totalCommon = 0;
  let totalNew = 0;
  let totalDecrease = 0;
  for (let r = selectTime; r>1; r--){
    const cell7 = sheet[XLSX.utils.encode_cell({ c: 7, r: r })];
    const cell8 = sheet[XLSX.utils.encode_cell({ c: 8, r: r })];
    const cell9 = sheet[XLSX.utils.encode_cell({ c: 9, r: r })];
    // console.log("** =", [cell7, cell8, cell9])
    if (!cell7 || cell7.v === 0 || cell7.v === undefined || cell7.v === null || String(cell7.v).trim() === '') continue;
    if (!cell8 || cell8.v === 0 || cell8.v === undefined || cell8.v === null || String(cell8.v).trim() === '') continue;
    if (!cell9 || cell9.v === 0 || cell9.v === undefined || cell9.v === null || String(cell9.v).trim() === '') continue;
    totalCommon = Number(rows[r][7] || 0) / Number(rows[r][10] || 0);
    totalNew = Number(rows[r][8] || 0) / Number(rows[r][10] || 0);
    totalDecrease = Number(rows[r][9] || 0) / Number(rows[r][10] || 0);
    // console.log("** =", [totalCommon, totalNew, totalDecrease])
    break
  }
  // const totalCommon = Number(rows[selectTime][7] || 0) / Number(rows[selectTime][10] || 0);
  // const totalNew = Number(rows[selectTime][8] || 0) / Number(rows[selectTime][10] || 0);
  // const totalDecrease = Number(rows[selectTime][9] || 0) / Number(rows[selectTime][10] || 0);
  return [totalCommon, totalNew, totalDecrease]
    // averageDayPerServing
}

// const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');

// try {
//   const { CarbonFootprintIndex_from_inputActivities, CarbonFootprintIndex_from_serviceProcessing, CarbonFootprintIndex_from_endOfService, CarbonFootprintIndex_Total, averageDayPerServing } = readGeneral2Data(workbook);
//   console.log('Carbon Footprint:', CarbonFootprintIndex_from_inputActivities);
//   console.log('Plastic Bottle %:', CarbonFootprintIndex_from_serviceProcessing);
//   console.log('Food Waste:', CarbonFootprintIndex_from_endOfService);
//   console.log('plastic_bottle_Path:', CarbonFootprintIndex_Total)
//   console.log('plastic_bottle_Path:', averageDayPerServing)
// } catch (error) {
//   console.error('Lỗi đọc file:', error.message);
// }
