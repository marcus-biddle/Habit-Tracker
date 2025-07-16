import { useState, useEffect } from 'react';
import { Filter, Activity, TrendingUp, ChevronRight, ChevronLeft, ChartArea, User2 } from 'lucide-react';
import { Show } from '../helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ScoreModal } from './ScoreModal';
import LoginModal from './LoginModal';

// Mock categories - replace with your actual categories
const categories = [
  { key: 'pushups', label: 'Push-ups' },
  { key: 'pullups', label: 'Pull-ups' },
  { key: 'squats', label: 'Squats' },
  { key: 'plank', label: 'Plank (seconds)' }
];

interface GoogleSheetsModalProps {
  setOpen: (show: boolean) => void;
}

interface SheetData {
  name: string;
  score: string;
  category: string;
  timestamp?: string;
}

// export const GoogleSheetsModal = ({ setOpen }: GoogleSheetsModalProps) => {
//   const [submitForm, setSubmitForm] = useState({ 
//     name: '', 
//     score: '', 
//     category: 'pushups' 
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [recentData, setRecentData] = useState<SheetData[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   // Google Sheets configuration
//   const SHEET_ID = '1La_601EPgc9BGWlZSoR-ZdozU041w5hSf7Ents4eAc8'; // Replace with your Google Sheet ID
//   const API_KEY = 'AIzaSyBChEDpQCfwkxm0erHJsZ7StGhoYLLEmVs'; // Replace with your Google Sheets API key
//   const SHEET_NAME = 'Push'; // Replace with your sheet name
//   const RANGE = 'A:D'; // Adjust range as needed (Name, Score, Category, Timestamp)

//   // Function to fetch data from Google Sheets
//   const fetchSheetData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.error) {
//         throw new Error(data.error.message);
//       }
      
//       // Parse the data (skip header row)
//       const rows = data.values?.slice(1) || [];
//       const parsedData: SheetData[] = rows.map((row: string[]) => ({
//         name: row[0] || '',
//         score: row[1] || '',
//         category: row[2] || '',
//         timestamp: row[3] || ''
//       }));
      
//       setRecentData(parsedData.slice(-5)); // Show last 5 entries
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch data');
//       console.error('Error fetching sheet data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to append data to Google Sheets
//   const appendToSheet = async (data: SheetData) => {
//     try {
//       const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!${RANGE}:append?valueInputOption=RAW&key=${API_KEY}`;
      
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           values: [[data.name, data.score, data.category, new Date().toISOString()]]
//         })
//       });
      
//       const result = await response.json();
      
//       if (result.error) {
//         throw new Error(result.error.message);
//       }
      
//       return result;
//     } catch (err) {
//       throw new Error(err instanceof Error ? err.message : 'Failed to submit data');
//     }
//   };

//   // Load data when modal opens
//   useEffect(() => {
//     fetchSheetData();
//   }, []);

//   const handleSubmit = async () => {
//     if (!submitForm.name || !submitForm.score) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       setError(null);
      
//       await appendToSheet({
//         name: submitForm.name,
//         score: submitForm.score,
//         category: submitForm.category,
//         timestamp: new Date().toISOString()
//       });
      
//       // Refresh data and close modal
//       await fetchSheetData();
//       setOpen(false);
//       setSubmitForm({ name: '', score: '', category: 'pushups' });
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to submit score');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
//         <h3 className="text-2xl font-bold text-white mb-4">Submit Your Score</h3>
        
//         {/* Error Display */}
//         {error && (
//           <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
//             <p className="text-red-400 text-sm">{error}</p>
//           </div>
//         )}
        
//         {/* API Configuration Warning */}
//         {(SHEET_ID === '1La_601EPgc9BGWlZSoR-ZdozU041w5hSf7Ents4eAc8' || API_KEY === 'AIzaSyBChEDpQCfwkxm0erHJsZ7StGhoYLLEmVs') && (
//           <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
//             <p className="text-yellow-400 text-sm">
//               Please configure your Google Sheets API key and Sheet ID to enable data submission.
//             </p>
//           </div>
//         )}
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Submit Form */}
//           <div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-gray-300 mb-2">Name</label>
//                 <input
//                   type="text"
//                   value={submitForm.name}
//                   onChange={(e) => setSubmitForm({...submitForm, name: e.target.value})}
//                   className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="Enter your name"
//                   disabled={isLoading}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-gray-300 mb-2">Category</label>
//                 <select
//                   value={submitForm.category}
//                   onChange={(e) => setSubmitForm({...submitForm, category: e.target.value})}
//                   className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   disabled={isLoading}
//                 >
//                   {categories.map((cat) => (
//                     <option key={cat.key} value={cat.key} className="bg-gray-800">
//                       {cat.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-gray-300 mb-2">Score</label>
//                 <input
//                   type="number"
//                   value={submitForm.score}
//                   onChange={(e) => setSubmitForm({...submitForm, score: e.target.value})}
//                   className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="Enter your score"
//                   disabled={isLoading}
//                 />
//               </div>
              
//               <div className="flex gap-3 pt-4">
//                 <button
//                   onClick={handleSubmit}
//                   disabled={isLoading}
//                   className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all"
//                 >
//                   {isLoading ? 'Submitting...' : 'Submit'}
//                 </button>
//                 <button
//                   onClick={() => setOpen(false)}
//                   disabled={isLoading}
//                   className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           {/* Recent Data Display */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h4 className="text-lg font-semibold text-white">Recent Submissions</h4>
//               <button
//                 onClick={fetchSheetData}
//                 disabled={isLoading}
//                 className="text-purple-400 hover:text-purple-300 disabled:opacity-50 text-sm"
//               >
//                 {isLoading ? 'Loading...' : 'Refresh'}
//               </button>
//             </div>
            
//             <div className="space-y-2 max-h-64 overflow-y-auto">
//               {recentData.length > 0 ? (
//                 recentData.map((entry, index) => (
//                   <div key={index} className="bg-black/20 border border-white/10 rounded-lg p-3">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="text-white font-medium">{entry.name}</p>
//                         <p className="text-gray-400 text-sm">
//                           {categories.find(cat => cat.key === entry.category)?.label || entry.category}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-purple-400 font-bold">{entry.score}</p>
//                         {entry.timestamp && (
//                           <p className="text-gray-500 text-xs">
//                             {new Date(entry.timestamp).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-gray-400 text-center py-8">
//                   {isLoading ? 'Loading data...' : 'No recent submissions'}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

interface GoogleSheetsModalProps {
  setOpen: (show: boolean) => void;
}

interface PersonScore {
  name: string;
  date: string;
  score: number;
}

interface LeaderboardData {
  [personName: string]: PersonScore[];
}

const SHEET_NAMES = [{sheet: 'Push', label: 'Push-ups'}, {sheet: 'Pull', label: 'Pull-ups'}, {sheet: 'Run', label: 'Running'}];

export const GoogleSheetsModal = ({ setOpen }: GoogleSheetsModalProps) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [selectedSheet, setSelectedSheet] = useState<string>(SHEET_NAMES[0].sheet)
  const [openGraphs, setOpenGraphs] = useState<boolean>(false);
  const [openScoreModal, setOpenScoreModal] = useState<boolean>(false);

  // Chart scrolling state
  const [chartScrollIndex, setChartScrollIndex] = useState(0);
  const [chartViewSize, setChartViewSize] = useState(30); // Number of data points visible at once

  // Google Sheets configuration
  const SHEET_ID = '1La_601EPgc9BGWlZSoR-ZdozU041w5hSf7Ents4eAc8'; // Replace with your Google Sheet ID
  const API_KEY = 'AIzaSyBChEDpQCfwkxm0erHJsZ7StGhoYLLEmVs'; // Replace with your Google Sheets API key
  // const SHEET_NAME = 'Run'; // Replace with your sheet name
  const RANGE = 'A1:K50'; // Adjust range as needed to cover your data
  
  // Function to fetch and parse data from Google Sheets
  const fetchSheetData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${selectedSheet}?key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('GS DATA', data)
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const rows = data.values || [];
      
      // Parse the data structure
      const parsedData: LeaderboardData = {};
      
      if (rows.length > 4) {
        // Row 5 (index 4) contains the names
        const nameRow = rows[4];
        
        // Find name columns (skip first 4 columns: Yr, Qtr Yr, Mo Yr, Date)
        const nameColumns: { [columnIndex: number]: string } = {};
        
        for (let colIndex = 4; colIndex < nameRow.length; colIndex++) {
          const name = nameRow[colIndex];
          if (name && name.trim()) {
            nameColumns[colIndex] = name.trim();
            parsedData[name.trim()] = [];
          }
        }
        
        // Process data rows (starting from row 6, index 5)
        for (let rowIndex = 5; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          if (row.length > 3) {
            const date = row[3]; // Column D contains dates
            
            if (date && date.trim()) {
              
              const parsedDate = new Date(date.trim());
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Strip time to compare only the date
              parsedDate.setHours(0, 0, 0, 0);

              if (parsedDate > today) continue;

              // For each person column, check if there's a score
              Object.entries(nameColumns).forEach(([colIndex, personName]) => {
                const rawScore = row[parseInt(colIndex)];
                const score = rawScore ? Number(rawScore.replace(/,/g, '')) : 0;
                if (score && !isNaN(Number(score))) {
                  parsedData[personName].push({
                    name: personName,
                    date: date.trim(),
                    score: score 
                  });
                }
              });
            }
          }
        }
      }
      
      setLeaderboardData(parsedData);
      
      
      // Set first person as selected by default
      const firstPerson = Object.keys(parsedData)[0];
      if (firstPerson && !selectedPerson) {
        setSelectedPerson(firstPerson);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching sheet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    fetchSheetData();
  }, [selectedSheet, selectedPerson, chartViewSize]);

  if (!leaderboardData[selectedPerson]) return;

  const canScrollLeft = chartScrollIndex > 0;
  const canScrollRight = chartScrollIndex < leaderboardData[selectedPerson].length - chartViewSize;
  const visibleChartData = leaderboardData[selectedPerson].slice(chartScrollIndex, chartScrollIndex + chartViewSize);
  console.log(visibleChartData)

  const scrollChart = (direction: string) => {
    if (direction === 'left' && canScrollLeft) {
      setChartScrollIndex(Math.max(0, chartScrollIndex - 1));
    } else if (direction === 'right' && canScrollRight) {
      setChartScrollIndex(Math.min(leaderboardData[selectedPerson].length - chartViewSize, chartScrollIndex + 1));
    }
  };

  const resetChartScroll = () => {
    setChartScrollIndex(Math.max(0, leaderboardData[selectedPerson].length - chartViewSize));
  };

  console.log(chartViewSize)

  // Reset chart scroll when time period changes
  // React.useEffect(() => {
  //   resetChartScroll();
  // }, [timePeriod]);

  

  

  

  console.log('leaderboardData', leaderboardData)

  // Calculate total scores for each person
  const getTotalScore = (personName: string) => {
    return leaderboardData[personName]?.reduce((sum, entry) => sum + entry.score, 0) || 0;
  };

  // Get recent scores for selected person
  const getRecentScores = (personName: string) => {
    return leaderboardData[personName]?.slice(-10) || []; // Last 10 entries
  };

  // Sort people by total score
  const sortedPeople = Object.keys(leaderboardData).sort((a, b) => 
    getTotalScore(b) - getTotalScore(a)
  );

  const getDataFormatted = () => {
    return;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-900 p-6 w-full overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">{SHEET_NAMES.find(item => item.sheet === selectedSheet)?.label} Leaderboard</h3>
          {/* <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button> */}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {/* API Configuration Warning */}
        {/* {(SHEET_ID === '1La_601EPgc9BGWlZSoR-ZdozU041w5hSf7Ents4eAc8' || API_KEY === 'AIzaSyBChEDpQCfwkxm0erHJsZ7StGhoYLLEmVs') && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-sm">
              Please configure your Google Sheets API key and Sheet ID to load data.
            </p>
          </div>
        )} */}
        <div className='flex justify-end gap-4 mb-4'>
          <div className="flex items-center gap-2">
            <Filter className="w-6 h-6 text-gray-400" />
            <select
              value={selectedSheet}
              onChange={(e) => {
                setSelectedSheet(e.target.value)
                setChartScrollIndex(0)
              }}
              className="bg-black/20 backdrop-blur-sm p-3 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-white focus:outline-none w-48"
            >
              {SHEET_NAMES.map((category, index) => (
                <option key={category.sheet} value={category.sheet} className="bg-gray-800 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => setOpenGraphs(!openGraphs)} className="bg-black/20 backdrop-blur-sm p-3 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-white focus:outline-none w-12">
              {openGraphs ? <Activity className='w-6 h-6 cursor-pointer' /> : <ChartArea className='w-6 h-6 cursor-pointer' />}
          </button>
          <button onClick={() => setOpenScoreModal(true)} className="bg-black/20 backdrop-blur-sm p-3 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-white focus:outline-none w-12">
              <User2 className='w-6 h-6 cursor-pointer' />
          </button>
        </div>
        
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard Overview */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Rankings</h4>
              <button
                onClick={fetchSheetData}
                disabled={isLoading}
                className="text-purple-400 hover:text-purple-300 disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 lg:max-h-110 overflow-y-auto">
              {sortedPeople.length > 0 ? (
                sortedPeople.map((person, index) => (
                  <div 
                    key={person}
                    onClick={() => {
                      setSelectedPerson(person)
                      setChartScrollIndex(0)
                    }}
                    className={`bg-black/20 border border-white/10 rounded-lg p-3 cursor-pointer transition-all hover:bg-black/30 ${
                      selectedPerson === person ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <p className="text-white font-medium">{person}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">{getTotalScore(person).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">{leaderboardData[person]?.length || 0} sessions</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">
                  {isLoading ? 'Loading data...' : 'No data available'}
                </div>
              )}
            </div>
          </div>
          
          <Show when={!openGraphs}>
            {/* Person Details */}
            <div className="lg:col-span-2">
              {selectedPerson && (
                <>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white mb-2">{selectedPerson}'s Performance</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-400">{getTotalScore(selectedPerson).toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Total Push-ups</p>
                      </div>
                      <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{leaderboardData[selectedPerson]?.length || 0}</p>
                        <p className="text-gray-400 text-sm">Sessions</p>
                      </div>
                      <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {leaderboardData[selectedPerson]?.length > 0 
                            ? Math.round(getTotalScore(selectedPerson) / leaderboardData[selectedPerson].length)
                            : 0}
                        </p>
                        <p className="text-gray-400 text-sm">Avg per Session</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-md font-medium text-white mb-3">Recent Sessions</h5>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {getRecentScores(selectedPerson).length > 0 ? (
                        getRecentScores(selectedPerson).reverse().map((entry, index) => (
                          <div key={index} className="bg-black/20 border border-white/10 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-white font-medium">{entry.score} push-ups</p>
                                <p className="text-gray-400 text-sm">{entry.date}</p>
                              </div>
                              <div className="text-right">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  entry.score >= 200 ? 'bg-green-500/20 text-green-400' :
                                  entry.score >= 100 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {entry.score >= 200 ? 'Excellent' :
                                    entry.score >= 100 ? 'Good' : 'Keep Going'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          No sessions recorded
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Show>
          
          <Show when={openGraphs}>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10 lg:col-span-2">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {selectedPerson}'s Performance
              </h3>
              {/* Chart Navigation */}
                <div className="flex items-center justify-between mb-4 px-5">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => scrollChart('left')}
                      disabled={!canScrollLeft}
                      className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => scrollChart('right')}
                      disabled={!canScrollRight}
                      className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={resetChartScroll}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all text-sm"
                    >
                      Latest
                    </button>
                    <div className='flex space-x-1'>
                      <button
                        onClick={() => setChartViewSize(7)}
                        className={`backdrop-blur-sm px-3 py-1 border rounded-lg font-sm transition-all duration-200 flex items-center text-white focus:outline-none ${
                          chartViewSize === 7 
                            ? 'bg-blue-500/30 border-blue-400/40 ring-1 ring-blue-400/20' 
                            : 'bg-black/20 border-white/10 hover:bg-black/30'
                        }`}
                      >
                        7 Day
                      </button>
                      <button
                        onClick={() => setChartViewSize(30)}
                        className={`backdrop-blur-sm px-3 py-1 border rounded-lg font-sm transition-all duration-200 flex items-center text-white focus:outline-none ${
                          chartViewSize === 30 
                            ? 'bg-blue-500/30 border-blue-400/40 ring-1 ring-blue-400/20' 
                            : 'bg-black/20 border-white/10 hover:bg-black/30'
                        }`}
                      >
                        30 Day
                      </button>
                    </div>
                    
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    Showing {chartScrollIndex + 1}-{Math.min(chartScrollIndex + chartViewSize, leaderboardData[selectedPerson].length)} of {leaderboardData[selectedPerson].length}
                  </div>
                </div>
              <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={visibleChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tickLine={true} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                        formatter={(value, name) => [value, 'score']}
                        labelFormatter={(label) => {
                          const dataPoint = visibleChartData.find(d => d.date === label);
                          return dataPoint ? dataPoint.date : label;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8B5CF6' }}
                      />
                  </LineChart>
                </ResponsiveContainer>
            </div>
          </Show>
        </div>

        <Show when={openScoreModal}>
          {/* <ScoreModal setOpen={setOpenScoreModal} /> */}
          <LoginModal />
        </Show>
      </div>
    </div>
  );
};