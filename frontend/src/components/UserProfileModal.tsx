import { useState, useMemo } from 'react';
import { Filter, Edit3, Trash2, Plus, Calendar, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Show } from '../helpers';

// Mock data and functions - replace with your actual implementations
const mockUser = {
  avatar_url: "🏃‍♂️",
  name: "John Doe",
  total_score_in_range: 245,
  current_streak: 7,
  lastUpdated: "2 hours ago"
};

const mockRecords = [
  { id: 1, date: "2025-01-15", score: 30, category: "Running", notes: "Morning jog in the park" },
  { id: 2, date: "2025-01-14", score: 25, category: "Running", notes: "Easy recovery run" },
  { id: 3, date: "2025-01-13", score: 35, category: "Running", notes: "Interval training session" },
  { id: 4, date: "2025-01-12", score: 20, category: "Running", notes: "Short run due to weather" },
  { id: 5, date: "2025-01-11", score: 40, category: "Running", notes: "Long weekend run" },
  { id: 6, date: "2024-12-20", score: 45, category: "Running", notes: "Year-end challenge run" },
  { id: 7, date: "2024-12-15", score: 28, category: "Running", notes: "Holiday season training" },
  { id: 8, date: "2024-11-25", score: 38, category: "Running", notes: "Thanksgiving run" },
  { id: 9, date: "2024-11-10", score: 32, category: "Running", notes: "Fall weather run" },
  { id: 10, date: "2024-10-31", score: 50, category: "Running", notes: "Halloween special run" },
  { id: 11, date: "2024-10-15", score: 27, category: "Running", notes: "Autumn colors run" },
  { id: 12, date: "2024-09-20", score: 42, category: "Running", notes: "Back to school routine" },
  { id: 13, date: "2024-08-05", score: 35, category: "Running", notes: "Summer heat training" },
  { id: 14, date: "2024-07-04", score: 30, category: "Running", notes: "Independence Day run" },
  { id: 15, date: "2024-06-15", score: 33, category: "Running", notes: "Mid-year checkpoint" }
];

const timePeriods = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' }
];

const mockTrendData = [
  { day: 'Mon', score: 25 },
  { day: 'Tue', score: 30 },
  { day: 'Wed', score: 35 },
  { day: 'Thu', score: 20 },
  { day: 'Fri', score: 40 },
  { day: 'Sat', score: 30 },
  { day: 'Sun', score: 25 }
];

export const UserProfileModal = () => {
  const [showUserProfile, setShowUserProfile] = useState(true);
  const [timePeriod, setTimePeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState(mockRecords);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: '', score: '', notes: '' });
  
  // Pagination state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'month', 'year'
  const [recordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock functions - replace with your actual implementations
  const getUserProfile = (id) => mockUser;
  const getScoreUnit = (category) => "minutes";
  const getTrendData = () => mockTrendData;
  const activeCategory = "running";

  // Pagination and filtering logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const current = new Date(currentDate);
      
      switch (viewMode) {
        case 'day':
          return recordDate.toDateString() === current.toDateString();
        case 'month':
          return recordDate.getMonth() === current.getMonth() && 
                 recordDate.getFullYear() === current.getFullYear();
        case 'year':
          return recordDate.getFullYear() === current.getFullYear();
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, currentDate, viewMode]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + direction);
        break;
    }
    
    setCurrentDate(newDate);
    setCurrentPage(1); // Reset to first page when changing date
  };

  const formatDateHeader = () => {
    const date = new Date(currentDate);
    const options = {
      day: viewMode === 'day' ? 'numeric' : undefined,
      month: viewMode !== 'year' ? 'long' : undefined,
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setCurrentPage(1);
  };

  const handleDeleteRecord = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
  };

  const handleUpdateRecord = () => {
    setRecords(records.map(record => 
      record.id === editingRecord.id ? editingRecord : record
    ));
    setEditingRecord(null);
  };

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.score) {
      const record = {
        id: Date.now(),
        date: newRecord.date,
        score: parseInt(newRecord.score),
        category: activeCategory,
        notes: newRecord.notes
      };
      setRecords([record, ...records]);
      setNewRecord({ date: '', score: '', notes: '' });
      setShowAddForm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!showUserProfile) return null;

  const user = getUserProfile(showUserProfile);
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl border border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">{user.avatar_url}</div>
          <div>
            <h3 className="text-2xl font-bold text-white">{user.name}</h3>
            <p className="text-gray-300">Current Score: {user.total_score_in_range} {getScoreUnit(activeCategory)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'bg-black/20 text-gray-300 hover:bg-black/30'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'records'
                ? 'bg-purple-600 text-white'
                : 'bg-black/20 text-gray-300 hover:bg-black/30'
            }`}
          >
            Records
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Show when={false}>
            <div>
              {/* Progress Chart */}
              <div className="mb-6">
                <div className='flex flex-row justify-between items-baseline px-5'>
                  <h4 className="text-lg font-semibold text-white mb-4">Progress {timePeriods.find(p => p.key === timePeriod)?.label}</h4>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value)}
                      className="bg-black/20 backdrop-blur-sm p-2 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-white focus:outline-none "
                    >
                      {timePeriods.map((period) => (
                        <option key={period.key} value={period.key} className="bg-gray-800 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ">
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{user.current_streak}</div>
                  <div className="text-gray-400">Day Streak</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{user.lastUpdated}</div>
                  <div className="text-gray-400">Last Active</div>
                </div>
              </div>
            </div>
          </Show>
          <Show when={true}>
            {/* Records Header */}
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Activity Records</h4>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </button>
              </div>

              {/* Date Navigation and View Mode */}
              <div className="bg-black/20 rounded-lg p-4 mb-4 border border-white/10">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* View Mode Selector */}
                  <div className="flex gap-2">
                    {['day', 'month', 'year'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setViewMode(mode);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-lg font-medium transition-all capitalize ${
                          viewMode === mode
                            ? 'bg-purple-600 text-white'
                            : 'bg-black/20 text-gray-300 hover:bg-black/30'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {/* Date Navigation */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateDate(-1)}
                      className="bg-black/20 hover:bg-black/30 text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="text-white font-medium min-w-[150px] text-center">
                      {formatDateHeader()}
                    </div>
                    
                    <button
                      onClick={() => navigateDate(1)}
                      className="bg-black/20 hover:bg-black/30 text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Today Button */}
                  <button
                    onClick={goToToday}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Records Count */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="text-white font-medium">
                      {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Add Record Form */}
              {showAddForm && (
                <div className="bg-black/20 rounded-lg p-4 mb-4 border border-white/10">
                  <h5 className="text-white font-medium mb-3">Add New Record</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Date</label>
                      <input
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Score</label>
                      <input
                        type="number"
                        value={newRecord.score}
                        onChange={(e) => setNewRecord({...newRecord, score: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Enter score"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Notes</label>
                      <input
                        type="text"
                        value={newRecord.notes}
                        onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleAddRecord}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewRecord({ date: '', score: '', notes: '' });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Records List */}
              <div className="space-y-3">
                {mockRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No records found for this {viewMode}</p>
                  </div>
                ) : (
                  mockRecords.map((record) => (
                  <div key={record.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                    {editingRecord?.id === record.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Date</label>
                          <input
                            type="date"
                            value={editingRecord.date}
                            onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Score</label>
                          <input
                            type="number"
                            value={editingRecord.score}
                            onChange={(e) => setEditingRecord({...editingRecord, score: parseInt(e.target.value)})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Notes</label>
                          <input
                            type="text"
                            value={editingRecord.notes}
                            onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="md:col-span-3 flex gap-2">
                          <button
                            onClick={handleUpdateRecord}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRecord(null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatDate(record.date)}
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {record.score} <span className="text-sm text-gray-400">{getScoreUnit(activeCategory)}</span>
                          </div>
                          {record.notes && (
                            <div className="text-gray-300 text-sm italic">
                              "{record.notes}"
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )))}
              </div>

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-all"
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-black/20 hover:bg-black/30 text-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-all"
                  >
                    Last
                  </button>
                </div>
              )}
          </Show>
        </div>
      </div>
    </div>
  )}