import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import fontkit from '@pdf-lib/fontkit'; // ← cần cái này
import jwt from 'jsonwebtoken';
import QRCode    from 'qrcode';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
import XLSX from 'xlsx';
const workbook = XLSX.readFile('./data/My_Proceeded_Data.xlsx');


// Route kiểm tra thông tin đăng nhập
import { readTDataSheets } from './T1.js';
import { readMenuAndActivitiesData } from './MenuAndActivities.js';
import { readGeneral2Data } from './General2.js';
import { readGeneralData } from './General.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// app.get('/', (req, res) => {
//   const token = req.query.token;   // hoặc req.query['token']
//   console.log("token from client = ", token);              // "abczyx"
//   // TODO: verify token, cập nhật DB, rồi redirect / render
// });

// app.get('/', async (req, res) => {
//   const token = req.query.token;                // "abcxyz" hoặc undefined
//   console.log("token from client = ", token);              // "abczyx"
// });


// app.post("/login", async (req, res) => {
async function loginHandler(req, res) {
    const { username, password } = req.body;
    let INPDATA = [];
    try {
        INPDATA = readTDataSheets(workbook);
        console.log("Loaded INPDATA:");
        console.log(JSON.stringify(INPDATA, null, 2));
    } catch (err) {
        console.error("Lỗi khi đọc dữ liệu từ file Excel:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi xử lý dữ liệu"
        });
    }
    //   console.log(username);
    //   console.log(password);
    // Tìm trong INPDATA xem có group nào chứa username và password khớp không
    
    //   console.log(userGroup);
    //   console.log(typeof userGroup);
    
    // console.log("Tour_Guide =", Tour_Guide)
    if (String(password).slice(0, 4).toUpperCase() == "EMIC") {
        // const Tour_Guide = INPDATA.find(item =>
            // item["Tour_Guide"].includes(String(username).trim())
        // );
        const Tour_Name_INP = String(password).slice(4);
        const TourGuide_Tour_Inform = INPDATA.filter(item =>
        String(item.Tour_Guide).includes(String(username).trim())&&
        String(item["Tour_Name"]).trim() === Tour_Name_INP.trim()
        );
        console.log("Hello Ok", TourGuide_Tour_Inform)
        if (TourGuide_Tour_Inform.length > 0){
            console.log("Hello0")
            // const jwt  = require('jsonwebtoken');
            const list_qr = [];
            for (const TourGuide_Tour_Inform_v of TourGuide_Tour_Inform){
                console.log("TourGuide_Tour_Inform_v[Pax_Account] =", TourGuide_Tour_Inform_v["Pax_Account"])
                for (const Customer_Name of TourGuide_Tour_Inform_v["Pax_Account"]){
                    let token_string = String(username).trim() + " " + Tour_Name_INP + " " + Customer_Name;
                    const key = "emic_key"
                    const url = "http://localhost:3000/?token=" + jwt.sign({ custom: token_string }, key);
                    console.log("token =", url)
                    const qrData  = await QRCode.toDataURL(url, {
                        margin: 1,
                        scale : 6,
                        errorCorrectionLevel: 'M',
                    });
                    list_qr.push({ Customer_Name: Customer_Name, qr: qrData });
                }
            }
            // console.log("Hello1, list_qr =", list_qr)
            const responseData = {
                success_message: "T_G",
                images: list_qr,
            };
            res.json(responseData);
            console.log("Hello2")
        }
    } else{
        const userGroup = INPDATA.find(item =>
            item["Pax_Account"].includes(String(username).trim()) &&
            (
            String(item["SharePassword"]).trim() === String(password).trim() ||
            String(item["Tour_Name"]).trim() === String(password).trim()
            )
        );
    if (userGroup) {
        let MenuAndActivitiesData = {};
        try {
            MenuAndActivitiesData = readMenuAndActivitiesData(workbook);
            // console.log('MenuAndActivitiesData:', MenuAndActivitiesData);
        } catch (err) {
            console.error(err);
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentDate = new Date(currentYear, now.getMonth(), now.getDate()); // reset giờ để so sánh ngày
        const currentHour = now.getHours();

        // const currentMonth = now.getMonth(); // Lấy tháng (0 - 11)
        // console.log(currentMonth);

        // let CarbonFootprintIndex_Total = [null, null, null]
        // // let CarbonFootprintIndex_Total = -1;
        // try {
        //     CarbonFootprintIndex_Total = readGeneral2Data(workbook, currentMonth);
        //     console.log('CarbonFootprintIndex_Total:', CarbonFootprintIndex_Total)
        //     // console.log('averageDayPerServing:', averageDayPerServing)
        // } catch (error) {
        //     console.error('Lỗi đọc file:', error.message);
        // }
        
        let totalUpToNow = 0;
        let total = 0;
        let cntUpToNow = 0;
        let cntTotal = 0;
        const timetable = userGroup.TimeTable || {};
        let selectMonth = -1;
        for (const [dateKey, activities] of Object.entries(timetable)) {
            const [month, day, yearSuffix] = dateKey.split("/").map(Number);
            const year = 2000 + yearSuffix;
            const activityDate = new Date(year, month - 1, day);
            selectMonth = new Date(year, month-1)
            console.log('selectMonth =', selectMonth)

            if (!(activities && Array.isArray(activities))) continue;

            if (activityDate < currentDate) {
                // Ngày quá khứ → tính toàn bộ 24 giờ
                for (let i = 0; i < 24; i++) {
                    const act = activities[i];
                    cntUpToNow += 1
                    cntTotal += 1
                    if (act && MenuAndActivitiesData.hasOwnProperty(act)) {
                        totalUpToNow += MenuAndActivitiesData[act];
                        total += MenuAndActivitiesData[act];    
                    }
                }
            } else if (activityDate.getTime() === currentDate.getTime()) {
            // Ngày hiện tại → chỉ tính đến giờ hiện tại
                for (let i = 0; i <= currentHour; i++) {
                    cntUpToNow += 1
                    cntTotal += 1
                    const act = activities[i];
                    if (act && MenuAndActivitiesData.hasOwnProperty(act)) {
                        totalUpToNow += MenuAndActivitiesData[act];
                        total += MenuAndActivitiesData[act];
                    }
                }
                for (let i = currentHour+1; i < 24; i++) {
                    const act = activities[i];
                    cntTotal += 1
                    if (act && MenuAndActivitiesData.hasOwnProperty(act)) {
                        total += MenuAndActivitiesData[act];
                    }
                }
            } else {
                for (let i = 0; i < 24; i++) {
                    const act = activities[i];
                    cntTotal += 1
                    if (act && MenuAndActivitiesData.hasOwnProperty(act)) {
                        total += MenuAndActivitiesData[act];
                    }
                }
            }
            // Ngày tương lai → bỏ qua
        }
        // Tính số serial date tương ứng với ngày đầu tháng
        // const baseDate = new Date(Date.UTC(1899, 11, 30)); // Excel base date
        // const selectSerial = Math.floor((selectMonth - baseDate) / (1000 * 60 * 60 * 24));
        let CarbonFootprintIndex_Total = [null, null, null]
        try {
            CarbonFootprintIndex_Total = readGeneral2Data(workbook, selectMonth);
            console.log('CarbonFootprintIndex_Total:', CarbonFootprintIndex_Total)
            // console.log('averageDayPerServing:', averageDayPerServing)
        } catch (error) {
            console.error('Lỗi đọc file:', error.message);
        }

        const number1 = (CarbonFootprintIndex_Total[1] - total)/cntTotal*cntUpToNow + totalUpToNow;
        let total2 = total / CarbonFootprintIndex_Total[1]*CarbonFootprintIndex_Total[0];
        let totalUpToNow2 = totalUpToNow / CarbonFootprintIndex_Total[1]*CarbonFootprintIndex_Total[0];
        const number0 = (CarbonFootprintIndex_Total[0] - total2)/cntTotal*cntUpToNow + totalUpToNow2;
        // const number0 = (CarbonFootprintIndex_Total[0] - total)/cntTotal*cntUpToNow + totalUpToNow;
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // tháng tính từ 0
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        // await delay(2000);
        // setTimeout(() => {console.log("Sau 2 giây");}, 2000);
        // await sleep(1000);
        const responseData = {
            success_message: "client",
            userName: username,
            message: `As of ${day}/${month}/${year} - ${hours}:${minutes}`,
            totalOldConsumptionUntilNow: [number0, CarbonFootprintIndex_Total[0]],
            totalNewConsumptionUntilNow: [number1, CarbonFootprintIndex_Total[1]],
            gap: [number0 - number1, CarbonFootprintIndex_Total[2]],
            compare: [(number0 - number1) * 16.6 / 1000, (number0 - number1) * 6.7 / 1000],
        };
        // res.json({
        //     success: true,
        //     message: `As of ${day}/${month}/${year} - ${hours}:${minutes}`,
        //     // timetable: userGroup["TimeTable"],
        //     totalOldConsumptionUntilNow: [number0, CarbonFootprintIndex_Total[0]],
        //     totalNewConsumptionUntilNow: [number1, CarbonFootprintIndex_Total[1]],
        //     gap: [number0 - number1, CarbonFootprintIndex_Total[2]],
        //     compare: [(number0 - number1)*16.6/1000, (number0 - number1)*6.7/1000],
        // });
        // console.log(todayKey);
        console.log(totalUpToNow);
        console.log(total);
        console.log(cntUpToNow);
        console.log(cntTotal);
        console.log(number1);
        console.log(number0);
        console.log(number0-number1);

        if (number0 === CarbonFootprintIndex_Total[0] && number1 === CarbonFootprintIndex_Total[1] && number0 - number1 === CarbonFootprintIndex_Total[2]){
            responseData.certificateUrl = `./public/certificates/${encodeURIComponent(username)}.pdf`;
            responseData.certificateMessage1 = `✅ Congratulate! You have finished the tour with GGGG 🥳 Below is your certificate`
            responseData.certificateMessage2 = `👏 Thank you for being with us. We look forward to seeing you again!`
            if (!fs.existsSync(responseData.certificateUrl)) {
                const name = username; // hoặc tên thật của người dùng
                const existingPdfBytes = fs.readFileSync("./data/certificate-template.pdf");
                
                const pdfDoc = await PDFDocument.load(existingPdfBytes);
                pdfDoc.registerFontkit(fontkit);
                const page = pdfDoc.getPages()[0];
                // const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'Arial.ttf'));
                const customFont = await pdfDoc.embedFont(fontBytes);
                const textWidth = customFont.widthOfTextAtSize(name, 56);
                const { width } = page.getSize();
                const x = (width - textWidth) / 2;
                page.drawText(name, {
                    x: x,
                    y: 300,
                    size: 56,
                    font: customFont,
                    color: rgb(1, 1, 1),
                });
                let contentToPdf = `has finished the green tour and`
                page.drawText(contentToPdf, {
                    x: 150,
                    y: 240,
                    size: 30,
                    font: customFont,
                    color: rgb(1, 1, 1),
                });
                contentToPdf = `successfully saved ${number0 - number1} grams Carbon dioxide.`
                page.drawText(contentToPdf, {
                    x: 150,
                    y: 200,
                    size: 30,
                    font: customFont,
                    color: rgb(1, 1, 1),
                });
                const pdfBytes = await pdfDoc.save();
                // 2. Lưu file ra thư mục công khai để client có thể tải
                const outputPath = path.join(__dirname, "public", "certificates", `${username}.pdf`);
                fs.writeFileSync(outputPath, pdfBytes);
            }
        }
        return res.json(responseData);
    } else {
        res.status(401).json({
            success: false,
            message: "Tài khoản hoặc mật khẩu không đúng"
        });
    }
    }
}
// });

app.post('/login', loginHandler);

app.post('/Alogin', async (req, res) => {
    console.log("token =",);
    const { token } = req.body;
    console.log("token =", token);
    try {
            const key = "emic_key"
            const decoded = jwt.verify(token, key); // const secretKey       = process.env.JWT_SECRET || 'your-secret-key';
            console.log("decoded");
            console.log("HelloK 0")
            console.log(decoded.custom); // => giá trị Tour_Name_INP
            console.log(decoded); // => giá trị Tour_Name_INP
            const words = decoded.custom.split(" ");
            console.log("HelloK 1")
            // const Tour_Guide_Name = decoded.custom.slice(words[0])
            const password = words[1]
            console.log("HelloK 2")
            const username = words[2]
            // const { username, password } = req.body;
            // req.jwt = { Tour_Guide_Name, Tour_Name, username, decoded };
            console.log("HelloK 4")
            req.body = { username, password };
            console.log("HelloK 5", username, password)
            // res.json(loginHandler(req, res));
            return loginHandler(req, res);
    } catch (err) {
        // return res.status(401).send('Token không hợp lệ');
    }
});


app.get("/commonData", async (req, res) => {
    try {
        const {General1_carbon, carbon, General1_plastic, General1_waste, plastic_bottle_Path} = readGeneralData(workbook);
        console.log('Carbon Footprint:', General1_carbon);
        console.log('Plastic Bottle %:', General1_plastic);
        console.log('Food Waste:', General1_waste);
        console.log('plastic_bottle_Path:', plastic_bottle_Path)

        res.json({General1_carbon, carbon, General1_plastic, General1_waste, plastic_bottle_Path});
    } catch (error) {
        console.error('commonData not available!:', error.message);
        res.status(500).json({ error: 'Lỗi xử lý dữ liệu trên server' });
    }
});


// Bắt đầu server (ví dụ chạy cổng 3000)
app.listen(3000, () => {
  console.log("Server đang chạy tại http://localhost:3000");
});
