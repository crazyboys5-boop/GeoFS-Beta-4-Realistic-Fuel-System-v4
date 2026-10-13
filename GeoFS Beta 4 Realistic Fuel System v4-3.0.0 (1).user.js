// ==geo_fs==
// @name         GeoFS Beta 4 Realistic Fuel System - v4
// @namespace    http://tampermonkey.net/
// @version      2026-10-13
// @description  try to take over the world!
// @author       You
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://beta.geo-fs.com/geofs.php*
// @match        https://geo-fs.com/geofs.php*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // ==UserScript==
// @name         GeoFS Beta 4 Realistic Fuel System v4
// @namespace    geofs-custom-fuel
// @version      3.0.0
// @description  Aircraft-specific estimated fuel capacities and burn, airport-only refueling, and full fuel on aircraft switch.
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://beta.geo-fs.com/geofs.php*
// @match        https://geo-fs.com/geofs.php*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
'use strict';

if (window.__geofsFuelV3) return;
window.__geofsFuelV3 = true;

const UPDATE_MS = 500;
const AIRPORT_RADIUS_M = 1400;
const GROUND_TOLERANCE_M = 12;

// Approximate capacities in litres and fuel burn at full throttle
// in litres per minute. These are estimates, not GeoFS telemetry.
// Aircraft models are checked from top to bottom.
const P = [
[['a380'], 'Airbus A380', 320000, 220],
[['a350-1000','a350 1000'], 'Airbus A350-1000', 156000, 115],
[['a350'], 'Airbus A350', 141000, 105],
[['a340-600'], 'Airbus A340-600', 204000, 150],
[['a340'], 'Airbus A340', 147000, 115],
[['a330-900','a330neo'], 'Airbus A330neo', 139000, 100],
[['a330'], 'Airbus A330', 139000, 105],
[['a321'], 'Airbus A321', 30000, 48],
[['a320'], 'Airbus A320', 24200, 45],
[['a319'], 'Airbus A319', 24000, 42],
[['a318'], 'Airbus A318', 24200, 40],
[['a220'], 'Airbus A220', 21000, 35],
[['a300'], 'Airbus A300', 68000, 85],
[['a400m'], 'Airbus A400M', 50000, 65],
[['an-225','an225'], 'Antonov An-225', 300000, 260],
[['il-96-400','il96-400'], 'Ilyushin Il-96-400M', 150000, 115],
[['il-96','il96'], 'Ilyushin Il-96', 150000, 115],
[['il-76','il76'], 'Ilyushin Il-76', 109000, 125],
[['747-8'], 'Boeing 747-8', 243000, 190],
[['747sp'], 'Boeing 747SP', 199000, 165],
[['747-400'], 'Boeing 747-400', 216000, 185],
[['747'], 'Boeing 747', 216000, 185],
[['777-9'], 'Boeing 777X', 197000, 175],
[['777-300'], 'Boeing 777-300ER', 181000, 170],
[['777-200lr'], 'Boeing 777-200LR', 202000, 165],
[['777-200'], 'Boeing 777-200', 117000, 150],
[['777f','777 freighter'], 'Boeing 777 Freighter', 181000, 170],
[['777'], 'Boeing 777', 181000, 160],
[['787-10'], 'Boeing 787-10', 126000, 115],
[['787-9'], 'Boeing 787-9', 126000, 110],
[['787-8'], 'Boeing 787-8', 126000, 100],
[['787'], 'Boeing 787', 126000, 110],
[['767-400'], 'Boeing 767-400', 91000, 95],
[['767'], 'Boeing 767', 91000, 90],
[['757-300'], 'Boeing 757-300', 43400, 65],
[['757'], 'Boeing 757', 43400, 60],
[['737 max'], 'Boeing 737 MAX', 26000, 43],
[['737-900'], 'Boeing 737-900', 26000, 48],
[['737-800'], 'Boeing 737-800', 26000, 45],
[['737-700'], 'Boeing 737-700', 26000, 42],
[['737-600'], 'Boeing 737-600', 26000, 38],
[['737-200'], 'Boeing 737-200', 18000, 50],
[['737'], 'Boeing 737', 26000, 45],
[['720'], 'Boeing 720', 52000, 70],
[['kc-135','kc135','stratotanker'], 'KC-135 Stratotanker', 90000, 100],
[['dc-3','dc3'], 'Douglas DC-3', 3000, 8],
[['dc-10','dc10'], 'McDonnell Douglas DC-10', 194000, 170],
[['md-11','md11'], 'McDonnell Douglas MD-11', 194000, 165],
[['md-88'], 'McDonnell Douglas MD-88', 22000, 45],
[['concorde'], 'Concorde', 95000, 190],
[['l-1011','l1011','tristar'], 'Lockheed L-1011', 150000, 145],
[['crj-900','crj900'], 'Bombardier CRJ-900', 8900, 22],
[['crj-700','crj700'], 'Bombardier CRJ-700', 6800, 18],
[['crj-200','crj200'], 'Bombardier CRJ-200', 6800, 17],
[['dash 8','dash8','q400'], 'Dash 8 Q400', 6500, 14],
[['atr 72','atr72'], 'ATR 72', 5000, 10],
[['atr 42','atr42'], 'ATR 42', 4000, 8],
[['saab 340','saab340'], 'Saab 340', 3200, 8],
[['e195'], 'Embraer E195', 13000, 25],
[['e190'], 'Embraer E190', 13000, 24],
[['e175','erj-170','erj 170'], 'Embraer E175/E170', 10000, 20],
[['erj145','erj-145','145lr'], 'Embraer ERJ-145', 5000, 13],
[['emb120','brasília','brasilia'], 'Embraer EMB-120', 3000, 8],
[['twin otter','dhc-6','dhc6'], 'DHC-6 Twin Otter', 1200, 5],
[['dhc-2','beaver'], 'DHC-2 Beaver', 250, 1.4],
[['dornier 228','do228','do-228'], 'Dornier 228', 2000, 5],
[['phenom 100'], 'Embraer Phenom 100', 1200, 5],
[['learjet 45','learjet45'], 'Learjet 45', 4000, 12],
[['challenger 650'], 'Challenger 650', 15000, 24],
[['citation'], 'Cessna Citation', 4000, 12],
[['vision jet','sf50'], 'Cirrus Vision Jet', 900, 4],
[['pc-24','pc24'], 'Pilatus PC-24', 2500, 7],
[['pc-12','pc12'], 'Pilatus PC-12', 1200, 3.5],
[['baron','b55'], 'Beechcraft Baron', 500, 2.5],
[['sr22'], 'Cirrus SR22', 348, 1.5],
[['cessna 152','c152'], 'Cessna 152', 87, 0.55],
[['cessna 172','c172'], 'Cessna 172', 212, 0.85],
[['r182'], 'Cessna R182', 330, 1.2],
[['skymaster','337'], 'Cessna 337', 335, 1.7],
[['pa-28','pa28','warrior'], 'Piper PA-28', 189, 0.8],
[['cubcrafters','xcub','husky','a-1b'], 'Bush aircraft', 150, 1],
[['piper j-3','piper j3','piper cub'], 'Piper J-3 Cub', 45, 0.35],
[['cri-cri','cricri','mc-15'], 'Colomban Cri-cri', 20, 0.35],
[['sportstar'], 'Evektor SportStar', 80, 0.45],
[['rv-6','rv6'], 'Van’s RV-6', 160, 0.8],
[['sonex'], 'Sonex-B', 75, 0.5],
[['pitts'], 'Pitts Special', 100, 1.4],
[['z-50','zlin'], 'Zlin Z-50', 100, 1.5],
[['potez 25'], 'Potez 25', 250, 1.6],
[['pc-7','pc7'], 'Pilatus PC-7', 700, 3],
[['f-16','f16','fighting falcon'], 'F-16 Fighting Falcon', 3200, 45],
[['f/a-18','fa-18','f18','super hornet'], 'F/A-18 Super Hornet', 6800, 65],
[['f-14','f14','tomcat'], 'F-14 Tomcat', 7300, 65],
[['f-15','f15','eagle'], 'F-15 Eagle', 6100, 60],
[['f-22','f22','raptor'], 'F-22 Raptor', 8200, 70],
[['f-35','f35','lightning ii'], 'F-35', 8300, 65],
[['su-35','su35'], 'Sukhoi Su-35', 11500, 65],
[['rafale'], 'Dassault Rafale', 4700, 45],
[['mirage 2000'], 'Dassault Mirage 2000', 3900, 40],
[['alpha jet','alphajet'], 'Alpha Jet', 2000, 25],
[['t-38','t38','talon'], 'Northrop T-38', 2500, 28],
[['p-38','p38'], 'Lockheed P-38', 1800, 12],
[['corsair','f4u'], 'F4U Corsair', 900, 10],
[['spitfire'], 'Spitfire', 400, 5],
[['sr-71','sr71','blackbird'], 'SR-71 Blackbird', 46000, 250],
[['xb-70','xb70','valkyrie'], 'XB-70 Valkyrie', 170000, 300],
[['x-15','x15'], 'North American X-15', 15000, 500],
[['a-10','a10','thunderbolt'], 'A-10 Thunderbolt II', 6800, 35],
[['b-2','b2','spirit'], 'B-2 Spirit', 75000, 140],
[['e-2c','hawkeye'], 'E-2 Hawkeye', 9000, 20],
[['mq9','reaper'], 'MQ-9 Reaper', 1800, 5],
[['aw609'], 'Leonardo AW609', 2500, 8],
[['ec135'], 'Eurocopter EC135', 700, 4],
[['as365','dauphin'], 'AS365 Dauphin', 900, 5],
[['uh-1','uh1','iroquois','huey'], 'Bell UH-1H', 950, 5],
[['r-44','r44'], 'Robinson R-44', 180, 1.5],
[['r-22','r22'], 'Robinson R-22', 75, 0.9],
[['hughes 269','th-55','osage','269a'], 'Hughes 269 / TH-55', 95, 1],
[['balloon','major tom','blimp','roziere'], 'Balloon / airship', 1, 0],
[['glider','jantar','perlan','silent 2','motor glider'], 'Glider / motor glider', 35, 0.2],
[['paraglider','hang glider','wingsuit','airchair'], 'Unpowered glider', 1, 0]
];

const DEFAULT = {
    name: 'Other aircraft — generic profile',
    capacity: 250,
    burn: 2.5
};

// Airports retained from the original script.

const AIRPORTS = [
  // United States — West Coast
  ['KSEA Seattle-Tacoma', 47.4502, -122.3088],
  ['KPAE Paine Field', 47.9063, -122.2816],
  ['KBFI Boeing Field', 47.5300, -122.3019],
  ['KPDX Portland', 45.5898, -122.5951],
  ['KEUG Eugene', 44.1246, -123.2119],
  ['KMFR Medford', 42.3742, -122.8735],
  ['KSFO San Francisco', 37.6213, -122.3790],
  ['KOAK Oakland', 37.7126, -122.2197],
  ['KSJC San Jose', 37.3626, -121.9290],
  ['KSMF Sacramento', 38.6954, -121.5908],
  ['KLAX Los Angeles', 33.9416, -118.4085],
  ['KBUR Hollywood Burbank', 34.2007, -118.3587],
  ['KSNA Orange County', 33.6757, -117.8682],
  ['KONT Ontario California', 34.0560, -117.6012],
  ['KSAN San Diego', 32.7338, -117.1933],
  ['KPSP Palm Springs', 33.8297, -116.5070],

  // Southwest
  ['KLAS Las Vegas', 36.0840, -115.1537],
  ['KRNO Reno', 39.4991, -119.7681],
  ['KPHX Phoenix', 33.4342, -112.0116],
  ['KTUS Tucson', 32.1161, -110.9410],
  ['KFLG Flagstaff', 35.1385, -111.6712],
  ['KDEN Denver', 39.8561, -104.6737],
  ['KCOS Colorado Springs', 38.8058, -104.7008],
  ['KGJT Grand Junction', 39.1227, -108.5267],
  ['KSLC Salt Lake City', 40.7899, -111.9791],
  ['KBOI Boise', 43.5644, -116.2228],
  ['KTWF Twin Falls', 42.4818, -114.4877],
  ['KMSO Missoula', 46.9163, -114.0906],
  ['KGPI Glacier Park', 48.3105, -114.2559],
  ['KBIL Billings', 45.8077, -108.5429],
  ['KHLN Helena', 46.6068, -111.9828],
  ['KGTF Great Falls', 47.4820, -111.3707],
  ['KIDA Idaho Falls', 43.5146, -112.0708],
  ['KJAC Jackson Hole', 43.6073, -110.7377],
  ['KCPR Casper', 42.9080, -106.4644],
  ['KABQ Albuquerque', 35.0402, -106.6090],
  ['KSAF Santa Fe', 35.6171, -106.0894],
  ['KELP El Paso', 31.8072, -106.3776],
  ['KAMA Amarillo', 35.2194, -101.7059],
  ['KLBB Lubbock', 33.6636, -101.8228],

  // Texas and central United States
  ['KDFW Dallas Fort Worth', 32.8998, -97.0403],
  ['KDAL Dallas Love Field', 32.8471, -96.8518],
  ['KAUS Austin', 30.1975, -97.6664],
  ['KSAT San Antonio', 29.5337, -98.4698],
  ['KHOU Houston Hobby', 29.6454, -95.2789],
  ['KIAH Houston Intercontinental', 29.9902, -95.3368],
  ['KCRP Corpus Christi', 27.7704, -97.5012],
  ['KMAF Midland', 31.9425, -102.2019],
  ['KOKC Oklahoma City', 35.3931, -97.6007],
  ['KTUL Tulsa', 36.1984, -95.8881],
  ['KICT Wichita', 37.6499, -97.4331],
  ['KMCI Kansas City', 39.2976, -94.7139],
  ['KSTL St Louis', 38.7487, -90.3700],
  ['KSGF Springfield Missouri', 37.2457, -93.3886],
  ['KOMA Omaha', 41.3032, -95.8941],
  ['KLNK Lincoln', 40.8509, -96.7592],
  ['KDSM Des Moines', 41.5340, -93.6631],
  ['KMSP Minneapolis St Paul', 44.8848, -93.2223],
  ['KFAR Fargo', 46.9207, -96.8158],
  ['KRAP Rapid City', 44.0453, -103.0574],
  ['KSUX Sioux City', 42.4026, -96.3844],

  // Great Lakes and Midwest
  ['KORD Chicago O Hare', 41.9742, -87.9073],
  ['KMDW Chicago Midway', 41.7868, -87.7522],
  ['KMKE Milwaukee', 42.9472, -87.8966],
  ['KGRB Green Bay', 44.4851, -88.1296],
  ['KMSN Madison', 43.1399, -89.3375],
  ['KDTW Detroit', 42.2162, -83.3554],
  ['KGRR Grand Rapids', 42.8808, -85.5228],
  ['KFNT Flint', 42.9654, -83.7436],
  ['KCLE Cleveland', 41.4117, -81.8498],
  ['KCAK Akron Canton', 40.9161, -81.4422],
  ['KPIT Pittsburgh', 40.4959, -80.2329],
  ['KIND Indianapolis', 39.7173, -86.2944],
  ['KFWA Fort Wayne', 40.9785, -85.1951],
  ['KCMH Columbus Ohio', 39.9980, -82.8919],
  ['KDAY Dayton', 39.9024, -84.2194],
  ['KCVG Cincinnati Northern Kentucky', 39.0488, -84.6678],
  ['KSDF Louisville', 38.1744, -85.7360],
  ['KLEX Lexington', 38.0365, -84.6059],

  // Northeast
  ['KPHL Philadelphia', 39.8721, -75.2411],
  ['KJFK New York JFK', 40.6413, -73.7781],
  ['KLGA New York LaGuardia', 40.7769, -73.8740],
  ['KEWR Newark', 40.6895, -74.1745],
  ['KISP Long Island MacArthur', 40.7952, -73.1002],
  ['KALB Albany', 42.7483, -73.8017],
  ['KBUF Buffalo', 42.9405, -78.7322],
  ['KROC Rochester New York', 43.1189, -77.6724],
  ['KSYR Syracuse', 43.1112, -76.1063],
  ['KBOS Boston Logan', 42.3656, -71.0096],
  ['KPVD Providence', 41.7240, -71.4282],
  ['KBDL Hartford', 41.9389, -72.6832],
  ['KMHT Manchester New Hampshire', 42.9326, -71.4357],
  ['KBTV Burlington Vermont', 44.4719, -73.1533],
  ['KBGR Bangor', 44.8074, -68.8281],

  // Mid-Atlantic and Southeast
  ['KIAD Washington Dulles', 38.9531, -77.4565],
  ['KDCA Washington Reagan', 38.8512, -77.0402],
  ['KBWI Baltimore', 39.1754, -76.6683],
  ['KRDU Raleigh Durham', 35.8776, -78.7875],
  ['KCLT Charlotte', 35.2140, -80.9431],
  ['KGSO Greensboro', 36.0978, -79.9373],
  ['KAVL Asheville', 35.4362, -82.5418],
  ['KATL Atlanta', 33.6407, -84.4277],
  ['KSAV Savannah', 32.1276, -81.2021],
  ['KCHS Charleston South Carolina', 32.8986, -80.0405],
  ['KCAE Columbia South Carolina', 33.9388, -81.1195],
  ['KJAX Jacksonville', 30.4941, -81.6879],
  ['KTPA Tampa', 27.9755, -82.5332],
  ['KMCO Orlando', 28.4312, -81.3081],
  ['KSFB Orlando Sanford', 28.7776, -81.2375],
  ['KPIE St Petersburg Clearwater', 27.9102, -82.6874],
  ['KRSW Fort Myers', 26.5362, -81.7552],
  ['KMIA Miami', 25.7959, -80.2870],
  ['KFLL Fort Lauderdale', 26.0726, -80.1527],
  ['KPBI Palm Beach', 26.6832, -80.0956],
  ['KEYW Key West', 24.5561, -81.7596],

  // Tennessee, Alabama, Mississippi, Louisiana and Arkansas
  ['KMEM Memphis', 35.0424, -89.9767],
  ['KBNA Nashville', 36.1263, -86.6774],
  ['KHSV Huntsville', 34.6372, -86.7751],
  ['KBHM Birmingham Alabama', 33.5629, -86.7535],
  ['KMOB Mobile', 30.6912, -88.2428],
  ['KPNS Pensacola', 30.4734, -87.1866],
  ['KECP Panama City', 30.3571, -85.7954],
  ['KMSY New Orleans', 29.9934, -90.2580],
  ['KBTR Baton Rouge', 30.5332, -91.1496],
  ['KJAN Jackson Mississippi', 32.3112, -90.0759],
  ['KSHV Shreveport', 32.4466, -93.8256],
  ['KLIT Little Rock', 34.7294, -92.2243],
  ['KFSM Fort Smith', 35.3366, -94.3674],

  // Alaska and Hawaii
  ['PANC Anchorage', 61.1744, -149.9962],
  ['KFAI Fairbanks', 64.8151, -147.8564],
  ['PAJN Juneau', 58.3550, -134.5763],
  ['PAGS Gustavus', 58.4253, -135.7074],
  ['PHNL Honolulu', 21.3187, -157.9225],
  ['PHOG Kahului', 20.8986, -156.4305],
  ['PHKO Kona', 19.7388, -156.0456],
  ['PHLI Lihue', 21.9760, -159.3390],

  // Canada — British Columbia and the North
  ['CYVR Vancouver', 49.1967, -123.1815],
  ['CYXX Abbotsford', 49.0253, -122.3600],
  ['CYLW Kelowna', 49.9561, -119.3778],
  ['CYKA Kamloops', 50.7022, -120.4440],
  ['CYYJ Victoria', 48.6469, -123.4258],
  ['CYQQ Comox', 49.7108, -124.8867],
  ['CYXS Prince George', 53.8894, -122.6780],
  ['CYZF Yellowknife', 62.4628, -114.4403],
  ['CYXY Whitehorse', 60.7096, -135.0673],

  // Canada — Prairies
  ['CYYC Calgary', 51.1215, -114.0076],
  ['CYEG Edmonton', 53.3097, -113.5797],
  ['CYMM Fort McMurray', 56.6533, -111.2219],
  ['CYQL Lethbridge', 49.6303, -112.7997],
  ['CYQR Regina', 50.4319, -104.6658],
  ['CYXE Saskatoon', 52.1708, -106.6997],
  ['CYPA Prince Albert', 53.2142, -105.6728],
  ['CYWG Winnipeg', 49.9100, -97.2399],

  // Canada — Ontario and Quebec
  ['CYQT Thunder Bay', 48.3719, -89.3239],
  ['CYYZ Toronto Pearson', 43.6777, -79.6248],
  ['CYTZ Billy Bishop Toronto City', 43.6275, -79.3962],
  ['CYHM Hamilton', 43.1736, -79.9350],
  ['CYKF Region of Waterloo', 43.4608, -80.3786],
  ['CYXU London Ontario', 43.0356, -81.1539],
  ['CYOW Ottawa', 45.3225, -75.6692],
  ['CYUL Montreal Trudeau', 45.4706, -73.7408],
  ['CYHU Montreal Saint Hubert', 45.5175, -73.4169],
  ['CYQB Quebec City', 46.7911, -71.3933],
  ['CYAM Sault Ste Marie', 46.4850, -84.5094],
  ['CYTS Timmins', 48.5697, -81.3767],
  ['CYVO Val d Or', 48.0533, -77.7828],
  ['CYBG Bagotville', 48.3306, -70.9964],
  ['CYVP Kuujjuaq', 58.0961, -68.4269],

  // Canada — Atlantic provinces
  ['CYFC Fredericton', 45.8689, -66.5372],
  ['CYSJ Saint John', 45.3161, -65.8903],
  ['CYQM Moncton', 46.1122, -64.6786],
  ['CYYT St Johns', 47.6186, -52.7519],
  ['CYQX Gander', 48.9369, -54.5681],
  ['CYHZ Halifax', 44.8808, -63.5086],

  // Mexico
  ['MMMX Mexico City', 19.4363, -99.0721],
  ['MMUN Cancun', 21.0365, -86.8771],
  ['MMGL Guadalajara', 20.5218, -103.3111],
  ['MMTJ Tijuana', 32.5411, -116.9702],
  ['MMMY Monterrey', 25.7785, -100.1069],
  ['MMPR Puerto Vallarta', 20.6801, -105.2542],
  ['MMHO Hermosillo', 29.0959, -111.0479],
  ['MMCU Chihuahua', 28.7029, -105.9647],
  ['MMCL Culiacan', 24.7645, -107.4747],
  ['MMLP La Paz', 24.0727, -110.3620],
  ['MMSD Los Cabos', 23.1518, -109.7210],
  ['MMCP Campeche', 19.8168, -90.5003],
  ['MMMD Merida', 20.9370, -89.6577],
  ['MMZO Manzanillo', 19.1448, -104.5586],
  ['MMIA Colima', 19.2770, -103.5774],
  ['MMQT Queretaro', 20.6173, -100.1857],
  ['MMLO Leon Bajio', 20.9935, -101.4809],
  ['MMZC Zacatecas', 22.8971, -102.6869],
  ['MMTC Torreon', 25.5683, -103.4110],
  ['MMTX Tampico', 22.2964, -97.8659],
  ['MMVA Villahermosa', 17.9970, -92.8174],
  ['MMVR Veracruz', 19.1459, -96.1873],
  ['MMPS Puerto Escondido', 15.8769, -97.0891],
  ['MMOX Oaxaca', 16.9999, -96.7266],
  ['MMCM Chetumal', 18.5047, -88.3268],
  ['MMTO Toluca', 19.3371, -99.5660],
  ['MMBT Huatulco', 15.7753, -96.2626],
  ['MMZH Ixtapa Zihuatanejo', 17.6016, -101.4605],
  ['MMMA Matamoros', 25.7699, -97.5253],
  ['MMNL Nuevo Laredo', 27.4439, -99.5705],
  ['MMRX Reynosa', 26.0089, -98.2285],
  ['MMCS Ciudad Juarez', 31.6361, -106.4290],

  // Other international airports from your original list
  ['EGLL London Heathrow', 51.4700, -0.4543],
  ['EGKK London Gatwick', 51.1537, -0.1821],
  ['LFPG Paris CDG', 49.0097, 2.5479],
  ['EDDF Frankfurt', 50.0379, 8.5622],
  ['EHAM Amsterdam', 52.3105, 4.7683],
  ['LEMD Madrid', 40.4983, -3.5676],
  ['LIRF Rome Fiumicino', 41.8003, 12.2389],
  ['OMDB Dubai', 25.2532, 55.3657],
  ['VHHH Hong Kong', 22.3080, 113.9185],
  ['RJTT Tokyo Haneda', 35.5494, 139.7798],
  ['RJAA Tokyo Narita', 35.7720, 140.3929],
  ['YSSY Sydney', -33.9399, 151.1753],
  ['YMML Melbourne', -37.6733, 144.8433],
  ['WSSS Singapore', 1.3644, 103.9915],
  ['ZBAA Beijing', 40.0799, 116.6031],
  ['ZSPD Shanghai Pudong', 31.1443, 121.8083],
  ['FAOR Johannesburg', -26.1367, 28.2411],
  ['FACT Cape Town', -33.9700, 18.5972],
  ['SBGR Sao Paulo', -23.4356, -46.4731],
  ['SCEL Santiago', -33.3930, -70.7858],
  ['MDSD Santo Domingo', 18.5674, -69.6689]
];


async function loadNorthAmericanAirports() {
  const url =
    'https://davidmegginson.github.io/ourairports-data/airports.csv';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Could not download airport database: HTTP ${response.status}`
    );
  }

  const csv = await response.text();

  function parseCSVLine(line) {
    const fields = [];
    let field = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === ',' && !quoted) {
        fields.push(field);
        field = '';
      } else {
        field += ch;
      }
    }

    fields.push(field);
    return fields;
  }

  const lines = csv.split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  const col = name => headers.indexOf(name);

  const typeCol = col('type');
  const nameCol = col('name');
  const latCol = col('latitude_deg');
  const lonCol = col('longitude_deg');
  const countryCol = col('iso_country');
  const identCol = col('ident');
  const icaoCol = col('icao_code');
  const closedCol = col('closed');

  if (
    [
      typeCol,
      nameCol,
      latCol,
      lonCol,
      countryCol,
      identCol,
      icaoCol
    ].some(index => index < 0)
  ) {
    throw new Error('Airport database columns were not recognized.');
  }

  const countries = new Set(['US', 'CA', 'MX']);

  // Include every facility type recorded in the database.
  // This includes small airports, heliports, seaplane bases,
  // balloonports, and other recorded aerodromes.
  const existing = new Set(
    AIRPORTS.map(airport =>
      `${airport[0]}|${airport[1]}|${airport[2]}`.toUpperCase()
    )
  );

  let added = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const fields = parseCSVLine(lines[i]);

    if (!countries.has(fields[countryCol])) continue;

    // Skip facilities explicitly marked as closed.
    if (
      closedCol >= 0 &&
      ['yes', 'true', '1'].includes(
        (fields[closedCol] || '').trim().toLowerCase()
      )
    ) {
      skipped++;
      continue;
    }

    const name = (fields[nameCol] || '').trim();
    const latitude = Number(fields[latCol]);
    const longitude = Number(fields[lonCol]);

    const identifier =
      (fields[icaoCol] || '').trim() ||
      (fields[identCol] || '').trim();

    if (
      !name ||
      !identifier ||
      fields[latCol] === '' ||
      fields[lonCol] === '' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      continue;
    }

    const label = `${identifier} ${name}`;
    const key =
      `${label}|${latitude}|${longitude}`.toUpperCase();

    if (existing.has(key)) continue;

    AIRPORTS.push([label, latitude, longitude]);
    existing.add(key);
    added++;
  }

  console.log(
    `[Airports] Added ${added} facilities in the US, Canada, and Mexico.`
  );
  console.log(
    `[Airports] Skipped ${skipped} facilities marked closed.`
  );
  console.log(`[Airports] Total loaded: ${AIRPORTS.length}.`);

  return added;
}


const panel = document.createElement('div');
panel.id = 'gf3-panel';

panel.innerHTML = `
<header id="gf3-header">
  <span>GEOFS FUEL SYSTEM</span>
  <button id="gf3-min">−</button>
</header>
<section id="gf3-content">
  <div class="gf3-row"><span>Aircraft</span><b id="gf3-aircraft">Waiting...</b></div>
  <div class="gf3-row"><span>Fuel</span><b id="gf3-fuel">--</b></div>
  <div class="gf3-bar"><div id="gf3-fill"></div></div>
  <div class="gf3-row"><span>Tank capacity</span><b id="gf3-cap">--</b></div>
  <div class="gf3-row"><span>Burn rate</span><b id="gf3-burn">--</b></div>
  <div class="gf3-row"><span>Throttle</span><b id="gf3-throttle">--</b></div>
  <div class="gf3-row"><span>Estimated time left</span><b id="gf3-time">--</b></div>
  <div class="gf3-row"><span>Ground status</span><b id="gf3-ground">Checking...</b></div>
  <div class="gf3-row"><span>Nearest listed airport</span><b id="gf3-airport">Searching...</b></div>
  <div id="gf3-status">Waiting for GeoFS...</div>
  <button id="gf3-refuel">REFUEL AIRCRAFT</button>
  <div id="gf3-note">Refuel on the ground at a listed airport. Changing aircraft resets that aircraft to full fuel.</div>
</section>`;

const style = document.createElement('style');
style.textContent = `
#gf3-panel {
  position:fixed; top:100px; right:14px; width:285px;
  z-index:2147483647; color:#eaf2f7;
  background:rgba(13,24,34,.97); border:1px solid #6c8797;
  border-radius:7px; box-shadow:0 4px 18px #0009;
  font:12px/1.45 Arial,sans-serif; user-select:none;
}
#gf3-header {
  padding:10px; display:flex; justify-content:space-between;
  background:#233b4c; font-weight:bold; letter-spacing:1px; cursor:move;
}
#gf3-min { color:white; background:transparent; border:0; cursor:pointer; font-size:18px; }
#gf3-content { padding:12px; }
.gf3-row { display:flex; justify-content:space-between; gap:10px; margin:7px 0; }
.gf3-row span { color:#b8cbd5; }
.gf3-row b { text-align:right; max-width:165px; overflow-wrap:anywhere; }
.gf3-bar { height:13px; margin:10px 0; background:#263640; border:1px solid #607481; border-radius:3px; overflow:hidden; }
#gf3-fill { height:100%; width:100%; background:#38c878; transition:width .2s; }
#gf3-status { margin:10px 0; padding:9px 5px; text-align:center; font-weight:bold; background:#1b303c; border-radius:4px; }
#gf3-refuel { width:100%; padding:10px; color:white; background:#286c48; border:1px solid #5d9c79; border-radius:4px; font-weight:bold; cursor:pointer; }
#gf3-refuel:disabled { opacity:.45; cursor:not-allowed; }
#gf3-note { margin-top:9px; color:#91a9b6; font-size:10px; text-align:center; }
#gf3-panel.gf3-hidden #gf3-content { display:none; }
`;

document.documentElement.append(style, panel);
const $ = id => document.getElementById(id);

let fuel = null;
let profile = DEFAULT;
let currentKey = '';
let lastTime = Date.now();
let empty = false;

function aircraft() {
    return window.geofs?.aircraft?.instance || null;
}

function nameOf(a) {
    const values = [
        a?.aircraftRecord?.name,
        a?.definition?.name,
        a?.aircraft?.name,
        a?.name,
        a?.aircraftRecord?.id,
        a?.definition?.id,
        a?.id,
        a?.model
    ];
    return String(values.find(x => x != null && String(x).trim()) || 'Unknown aircraft');
}

function keyOf(a) {
    return (
        nameOf(a) + '|' +
        (a?.aircraftRecord?.id ?? a?.definition?.id ?? a?.id ?? '')
    ).toLowerCase();
}

function choose(a) {
    const name = (
        nameOf(a) + ' ' +
        (a?.aircraftRecord?.id ?? '') + ' ' +
        (a?.definition?.id ?? '')
    ).toLowerCase();

    const match = P.find(item =>
        item[0].some(keyword => name.includes(keyword))
    );

    return match
        ? {name: match[1], capacity: match[2], burn: match[3]}
        : DEFAULT;
}

function throttleOf() {
    const controls = window.controls;

    for (const value of [
        controls?.throttle,
        controls?.states?.throttle
    ]) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return Math.max(0, Math.min(1, value));
        }
    }

    return null;
}

function locOf(a) {
    const location = a?.llaLocation;
    if (!location || location.length < 3) return null;

    const lat = Number(location[0]);
    const lon = Number(location[1]);
    const alt = Number(location[2]);

    if (
        ![lat, lon, alt].every(Number.isFinite) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
    ) {
        return null;
    }

    return {lat, lon, alt, raw: location};
}

function distanceMeters(lat1, lon1, lat2, lon2) {
    const rad = value => value * Math.PI / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat1)) *
        Math.cos(rad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 6371000 * 2 *
        Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestAirport(location) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const airport of AIRPORTS) {
        const distance = distanceMeters(
            location.lat,
            location.lon,
            airport[1],
            airport[2]
        );

        if (distance < nearestDistance) {
            nearest = airport;
            nearestDistance = distance;
        }
    }

    return {airport: nearest, distance: nearestDistance};
}

function onGround(a, location) {
    try {
        const getGroundAltitude = window.geofs?.api?.getGroundAltitude;

        if (typeof getGroundAltitude === 'function') {
            const groundAltitude = Number(getGroundAltitude(location.raw));

            if (Number.isFinite(groundAltitude)) {
                return Math.abs(location.alt - groundAltitude) <= GROUND_TOLERANCE_M;
            }
        }
    } catch (error) {
        // Fall through to aircraft ground-contact flags if available.
    }

    if (typeof a?.onGround === 'boolean') return a.onGround;
    if (typeof a?.groundContact === 'boolean') return a.groundContact;

    return false;
}

function cutThrottle() {
    try {
        const controls = window.controls;

        if (typeof controls?.throttle === 'number') {
            controls.throttle = 0;
        }

        if (typeof controls?.states?.throttle === 'number') {
            controls.states.throttle = 0;
        }
    } catch (error) {
        console.warn('[GeoFS Fuel] Could not reduce throttle.', error);
    }
}

function setStatus(message, color) {
    $('gf3-status').textContent = message;
    $('gf3-status').style.color = color || '#eaf2f7';
}

function render(a, throttle, ground, airport, distance) {
    const capacity = profile.capacity;
    const percentage = capacity && fuel !== null
        ? 100 * fuel / capacity
        : 0;

    const burn = throttle === null
        ? null
        : profile.burn * throttle;

    $('gf3-aircraft').textContent = profile.name;

    $('gf3-fuel').textContent = fuel === null
        ? '--'
        : `${fuel.toLocaleString(undefined, {maximumFractionDigits: 1})} L (${percentage.toFixed(0)}%)`;

    $('gf3-cap').textContent = capacity.toLocaleString() + ' L';

    $('gf3-throttle').textContent = throttle === null
        ? '--'
        : Math.round(throttle * 100) + '%';

    $('gf3-burn').textContent = burn === null
        ? '--'
        : burn.toFixed(2) + ' L/min';

    if (burn > 0 && fuel > 0) {
        const minutes = Math.floor(fuel / burn);
        const hours = Math.floor(minutes / 60);

        $('gf3-time').textContent = hours
            ? `${hours}h ${minutes % 60}m`
            : `${minutes} min`;
    } else {
        $('gf3-time').textContent = '--';
    }

    $('gf3-fill').style.width =
        Math.max(0, Math.min(100, percentage)) + '%';

    $('gf3-fill').style.background =
        percentage <= 10 ? '#e74747' :
        percentage <= 25 ? '#edaa36' :
        '#38c878';

    $('gf3-ground').textContent =
        ground ? 'ON GROUND' : 'AIRBORNE / UNKNOWN';

    $('gf3-ground').style.color =
        ground ? '#64e6a0' : '#ffd166';

    $('gf3-airport').textContent = airport
        ? `${airport[0]} (${(distance / 1000).toFixed(1)} km)`
        : 'Location unavailable';

    const atAirport =
        Boolean(ground && airport && distance <= AIRPORT_RADIUS_M);

    $('gf3-refuel').disabled = !atAirport;

    if (!a) {
        setStatus('WAITING FOR AIRCRAFT', '#ffd166');
    } else if (empty) {
        setStatus('OUT OF FUEL — THROTTLE CUT', '#ff6565');
    } else if (percentage <= 10) {
        setStatus('CRITICAL FUEL — LAND SOON', '#ff6565');
    } else if (percentage <= 25) {
        setStatus('LOW FUEL', '#edaa36');
    } else if (atAirport) {
        setStatus('AIRPORT DETECTED — READY TO REFUEL', '#64e6a0');
    } else if (ground && airport) {
        setStatus('TAXI TO A LISTED AIRPORT TO REFUEL', '#ffd166');
    } else if (ground) {
        setStatus('NO LISTED AIRPORT NEARBY', '#ffd166');
    } else {
        setStatus('REFUELING UNAVAILABLE IN FLIGHT', '#ffd166');
    }
}

function tick() {
    const now = Date.now();
    const elapsedMinutes = Math.max(
        0,
        Math.min(2, (now - lastTime) / 60000)
    );

    lastTime = now;

    const a = aircraft();

    if (!a) {
        render(null, null, false, null, Infinity);
        return;
    }

    // Compare the aircraft name and ID, not only the object reference.
    // This helps detect switches when GeoFS reuses the same object.
    const key = keyOf(a);

    if (key !== currentKey) {
        currentKey = key;
        profile = choose(a);
        fuel = profile.capacity;
        empty = false;

        console.log(
            '[GeoFS Fuel] Aircraft switched; fuel reset:',
            nameOf(a),
            profile
        );
    }

    const location = locOf(a);
    const throttle = throttleOf();

    let ground = false;
    let airport = null;
    let distance = Infinity;

    if (location) {
        ground = onGround(a, location);

        const result = nearestAirport(location);
        airport = result.airport;
        distance = result.distance;
    }

    if (throttle !== null && !empty && fuel > 0) {
        fuel = Math.max(
            0,
            fuel - profile.burn * throttle * elapsedMinutes
        );

        if (fuel === 0) {
            empty = true;
            cutThrottle();
            console.warn('[GeoFS Fuel] Fuel exhausted.');
        }
    }

    if (empty) cutThrottle();

    render(a, throttle, ground, airport, distance);
}

$('gf3-refuel').addEventListener('click', () => {
    const a = aircraft();
    const location = locOf(a);

    if (!a || !location) {
        setStatus('CANNOT REFUEL: LOCATION UNAVAILABLE', '#ff6565');
        return;
    }

    const ground = onGround(a, location);
    const result = nearestAirport(location);

    if (!ground || result.distance > AIRPORT_RADIUS_M) {
        setStatus('REFUELING REQUIRES A LISTED AIRPORT', '#ff6565');
        return;
    }

    fuel = profile.capacity;
    empty = false;
    lastTime = Date.now();

    setStatus('REFUELED AT ' + result.airport[0], '#64e6a0');

    console.log('[GeoFS Fuel] Refueled at', result.airport[0]);
});

$('gf3-min').addEventListener('click', () => {
    panel.classList.toggle('gf3-hidden');

    $('gf3-min').textContent =
        panel.classList.contains('gf3-hidden') ? '+' : '−';
});

// Drag the panel with the mouse.
let dragging = false;
let offsetX = 0;
let offsetY = 0;

$('gf3-header').addEventListener('mousedown', event => {
    if (event.target === $('gf3-min')) return;

    dragging = true;

    const rect = panel.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    event.preventDefault();
});

document.addEventListener('mousemove', event => {
    if (!dragging) return;

    panel.style.left = Math.max(0, event.clientX - offsetX) + 'px';
    panel.style.top = Math.max(0, event.clientY - offsetY) + 'px';
    panel.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
    dragging = false;
});

loadNorthAmericanAirports()
  .catch(error => {
    console.error('[GeoFS Fuel] Airport loading failed:', error);
  })
  .finally(() => {
    tick();
    setInterval(tick, UPDATE_MS);
  });

console.log(
    '[GeoFS Fuel] v3 loaded. Fuel profiles are estimates; unknown or add-on aircraft use the generic profile.'
);
})();
})();