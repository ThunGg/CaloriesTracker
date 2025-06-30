import XLSX from 'xlsx';
import { readGeneralData } from './General.js';
import { readGeneral2Data } from './General2.js';
import { readMenuAndActivitiesData } from './MenuAndActivities.js';
import { readTDataSheets } from './T1.js';


export function ProcessingData() {

  const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');

  try {
    const { General1_carbon, General1_plastic, General1_waste, plastic_bottle_Path } = readGeneralData(workbook);
    // console.log('Carbon Footprint:', General1_carbon);
    // console.log('Plastic Bottle %:', General1_plastic);
    // console.log('Food Waste:', General1_waste);
    // console.log('plastic_bottle_Path:', plastic_bottle_Path)
  } catch (error) {
    console.error('Lỗi đọc file:', error.message);
  }

  try {
    const { CarbonFootprintIndex_Total } = readGeneral2Data(workbook);
    /*
    console.log('CarbonFootprintIndex_from_inputActivities:', CarbonFootprintIndex_from_inputActivities);
    console.log('CarbonFootprintIndex_from_serviceProcessing:', CarbonFootprintIndex_from_serviceProcessing);
    console.log('CarbonFootprintIndex_from_endOfService:', CarbonFootprintIndex_from_endOfService);
    */
    // console.log('CarbonFootprintIndex_Total:', CarbonFootprintIndex_Total)
    // console.log('averageDayPerServing:', averageDayPerServing)
  } catch (error) {
    console.error('Lỗi đọc file:', error.message);
  }

  try {
    const MenuAndActivitiesData = readMenuAndActivitiesData(workbook);
    // console.log('MenuAndActivitiesData:', JSON.stringify(MenuAndActivitiesData, null, 2));
  } catch (err) {
    console.error(err);
  }


  // console.error("4th");
  try {
    const T1 = readTDataSheets(workbook);
    // console.log(JSON.stringify(T1, null, 2));
  } catch (err) {
    console.error(err);
  }


  // return { carbon, plastic, waste, plastic_bottle_Path, };
}

ProcessingData()
