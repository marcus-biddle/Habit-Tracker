import React, { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Users, Medal, Award, Plus, User, Calendar, TrendingUp, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase} from "../client/client";
import {
    startOfYear,
    endOfYear,
    startOfISOWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    parseISO,
    eachDayOfInterval,
    format,
  } from 'date-fns';
import { Show } from '../helpers';
import { UserProfileModal } from '../components/UserProfileModal';
import { GoogleSheetsModal } from '../components/GoogleSheetsModal';


export type Period = 'week' | 'month' | 'year';
interface Action {
created_at: string; // ISODateString
category_key: string;
category_score: number;
}

export interface UserScore {
name: string;
id: string; // UUID
avatar_url: string;
current_streak: number;
Actions: Action[];
total_score_in_range: number;
lastUpdated: string;
}

type Category = 'pushups' | 'pullups' | 'running';
  

// Might be able to replace this is startOfISOWeek
const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
startOfWeek.setHours(0, 0, 0, 0);

export const categories = [
    { key: 'pushups', label: 'Push-ups', icon: Target, color: 'bg-red-500' },
    { key: 'pullups', label: 'Pull-ups', icon: Zap, color: 'bg-blue-500' },
    { key: 'running', label: 'Running', icon: Users, color: 'bg-green-500' }
];

const timePeriods = [
    // { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week', filter: startOfWeek.toISOString() },
    { key: 'month', label: 'This Month', filter: startOfMonth(now).toISOString() },
    { key: 'year', label: 'This Year', filter: startOfYear(now).toISOString() }
];

export const getScoreUnit = (category: string) => {
  return category === 'running' ? 'mi' : 'reps';
};

const FitnessLeaderboard = () => {
    const [userScores, setUserScores] = useState<UserScore[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category>('pushups');
    const [timePeriod, setTimePeriod] = useState<Period>('month');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // have not touched yet
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  

  // Pagination
  const totalPages = Math.ceil(userScores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</span>;
    }
  };

  

  const getUserProfile = (userId: string): UserScore | null => {
    return userScores.find(user => user.id === userId) || null;
  };

  // Generate overall progress data for charts
  const getOverallProgressData = (type: 'score' | 'streak') => {
    const data = userScores;
    return data
            .filter((user: any) => type === 'score' ? user.total_score_in_range > 0 : user.current_streak > 0) // Only keep users with score > 0
            .map((user: any) => ({
                name: user.name.split(' ')[0],
                score: user.total_score_in_range,
                streak: user.current_streak,
            })).sort((a, b) => type === 'streak' ? b.streak - a.streak : b.score - a.score).slice(0,5);
  };

  

  

    const getUserScores = async () => {
        // Example of response structure
        // {
        //     name: "UserName",
        //     id: "UUID",
        //     avatar_url: "URL",
        //     current_streak: Number
        //     Actions: [
        //     {
        //         created_at: "ISODateString",
        //         category_key: "some_category",
        //         category_score: 20
        //     },
        //     {
        //         created_at: "ISODateString",
        //         category_key: "some_category",
        //         category_score: 100
        //     }
        //     ],
        //     total_score_in_range: 120
        // }
        const timePeriodFilter = timePeriods.find(p => p.key === timePeriod)?.filter;
        console.log(timePeriodFilter)
  
        const initialUserData: { data: any } = await supabase
        .from('Users')
        .select(`
        name,
        id,
        avatar_url,
        Actions (
            category_score,
            category_key,
            created_at
        )
        `)
        .filter('Actions.category_key', 'eq', `${activeCategory}`)
        .gte('Actions.created_at', timePeriodFilter) // might be redundant with the trend data functions
        // .range(startIndex, endIndex);

        const getTimeAgo = (dateString: string): string => {
            const now = new Date();
            const then = new Date(dateString);
            const diffMs = now.getTime() - then.getTime();
        
            const seconds = Math.floor(diffMs / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours   = Math.floor(minutes / 60);
            const days    = Math.floor(hours / 24);
        
            if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            return `just now`;
        };
        
        const calculateStreak = (actions: Action[]) => {
            // Create a Set of unique local date strings: 'YYYY-MM-DD'
            const activityDateStrings = Array.from(
                new Set(
                actions.map((a) => {
                    const date = new Date(a.created_at);
                    return date.toLocaleDateString('en-CA'); // Format: 'YYYY-MM-DD'
                })
                )
            ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            
            // Get today as a local string: 'YYYY-MM-DD'
            const today = new Date();
            // const todayStr = today.toLocaleDateString('en-CA');
            
            let streak = 0;
            for (let i = 0; i < activityDateStrings.length; i++) {
                const expectedDate = new Date();
                expectedDate.setDate(today.getDate() - i);
                const expectedStr = expectedDate.toLocaleDateString('en-CA');
            
                if (activityDateStrings.includes(expectedStr)) {
                streak++;
                } else {
                break;
                }
            }
            
            return streak;
        };
          
          
          const userScores = initialUserData.data
            .map((user: UserScore) => {
              const total_score_in_range = user.Actions.reduce(
                (sum, action) => sum + action.category_score,
                0
              );
          
              const current_streak = calculateStreak(user.Actions);
          
              const mostRecentAction = user.Actions.reduce((latest, action) =>
                new Date(action.created_at) > new Date(latest.created_at) ? action : latest,
                user.Actions[0]
              );
          
              const lastUpdated = mostRecentAction
                ? getTimeAgo(mostRecentAction.created_at)
                : "No activity";
          
              return {
                ...user,
                total_score_in_range,
                current_streak,
                lastUpdated,
              };
            })
            .sort((a: any, b: any) => b.total_score_in_range - a.total_score_in_range);
          

        console.log('userScores', userScores)
        setUserScores(userScores);
                
    }

    useEffect(() => {
        getUserScores();
    }, [activeCategory, timePeriod])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                Fitness Leaderboard
              </h1>
              <p className="text-purple-200">Track your progress and compete with friends</p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Submit Score
            </button>
          </div>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Tabs and Time Period Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2 border border-white/10 flex">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key as Category)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 w-38 ${
                    activeCategory === category.key
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={timePeriod}
              onChange={(e: any) => setTimePeriod(e.target.value)}
              className="bg-black/20 backdrop-blur-sm p-2 border border-white/10 px-4 py-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 w-60 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timePeriods.map((period) => (
                <option key={period.key} value={period.key} className="bg-gray-800 px-4 py-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 w-38 ">
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performers Chart */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performers
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getOverallProgressData('score')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                    }} 
                />
                <Bar dataKey="score" fill="#8B5CF6"  activeBar={{ fill: '#C4B5FD' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Streak Comparison */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Streak Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getOverallProgressData('streak')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                    }} 
                />
                <Bar dataKey="streak" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        

        {/* Leaderboard */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                {categories.find(c => c.key === activeCategory)?.label} Leaders
                <div className={`w-3 h-3 rounded-full ${categories.find(c => c.key === activeCategory)?.color}`}></div>
            </h2>
            </div>

          {/* Controls */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/70">Show:</span>
                            <select 
                                value={itemsPerPage}
                                onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                                }}
                                className="px-3 py-1 bg-white/10 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                            >
                                <option value={5} className="bg-slate-800 text-white">5</option>
                                <option value={10} className="bg-slate-800 text-white">10</option>
                                <option value={15} className="bg-slate-800 text-white">15</option>
                                <option value={20} className="bg-slate-800 text-white">20</option>
                            </select>
                        <span className="text-sm text-white/70">per page</span>
                    </div>
                    <div className="text-sm text-white/60">
                    Showing {startIndex + 1}-{Math.min(endIndex, userScores.length)} of {userScores.length} entries
                    </div>
                </div>
            </div>

          <div className="divide-y divide-white/10">
            {userScores.slice(startIndex, endIndex).map((user, index) => (
                <div key={user.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                {getRankIcon(startIndex + index + 1)}
                                <div className="text-3xl">{user.avatar_url}</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                    <span>🔥 {user.current_streak} day streak</span>
                                    <span>• {user.lastUpdated}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">
                                    {user.total_score_in_range}{getScoreUnit(activeCategory) === 'mi' ? '' : ''}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {getScoreUnit(activeCategory)}
                                </div>
                            </div>
                            <button
                            onClick={() => setActiveUserId(user.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <User className="w-5 h-5 text-gray-400 hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* Pagination */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-white/40">...</span>
                  ) : (
                    <button
                      onClick={() => goToPage(page as number)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {categories.map((category) => {
            const data = [];
            const currentData = [];
            const topScore = currentData[0]?.score || 0;
            const avgScore = Math.round(currentData.reduce((sum, user) => sum + user.score, 0) / currentData.length);
            const Icon = category.icon;
            
            return (
              <div key={category.key} className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white capitalize">{category.label}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Top Score ({timePeriods.find(p => p.key === timePeriod)?.label})</span>
                    <span className="text-white font-medium">
                      {topScore} {getScoreUnit(category.key)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Average</span>
                    <span className="text-white font-medium">
                      {avgScore} {getScoreUnit(category.key)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Participants</span>
                    <span className="text-white font-medium">{data.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div> */}
      </div>

        {/* User is not logged in and tries to click on restricted access */}
      <Show when={showSubmitModal}>
        <GoogleSheetsModal setOpen={setShowSubmitModal} />
      </Show>

      {/* Submit Score Modal */}
      {/* {showSubmitModal && !isLoggedIn && (
        <LoginModal />
      )} */}

      {/* User Profile Modal */}
      {activeUserId && ( <UserProfileModal user={getUserProfile(activeUserId)} setActiveUserId={setActiveUserId} activeCategory={activeCategory} timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
        // <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        //   <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-white/10">
        //     {(() => {
        //       const user = getUserProfile(activeUserId);
        //       if (!user) return null;
              
        //       return (
        //         <>
                  
                  
        //           <div className="mb-6">
        //             <div className='flex flex-row justify-between items-baseline px-5'>
        //                 <h4 className="text-lg font-semibold text-white mb-4">Progress {timePeriods.find(p => p.key === timePeriod)?.label}</h4>
        //                 <div className="flex items-center gap-2">
        //                     <Filter className="w-5 h-5 text-gray-400" />
        //                     <select
        //                     value={timePeriod}
        //                     onChange={(e: any) => setTimePeriod(e.target.value)}
        //                     className="bg-black/20 backdrop-blur-sm p-2 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-white focus:outline-none "
        //                     >
        //                     {timePeriods.map((period) => (
        //                         <option key={period.key} value={period.key} className="bg-gray-800 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ">
        //                         {period.label}
        //                         </option>
        //                     ))}
        //                     </select>
        //                 </div>
        //             </div>
                    
        //             <ResponsiveContainer width="100%" height={250}>
        //               <LineChart data={getTrendData()}>
        //                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        //                 <XAxis dataKey="day" stroke="#9CA3AF" />
        //                 <YAxis stroke="#9CA3AF" />
        //                 <Tooltip 
        //                   contentStyle={{ 
        //                     backgroundColor: '#1F2937', 
        //                     border: '1px solid #374151',
        //                     borderRadius: '8px',
        //                     color: '#F3F4F6'
        //                   }} 
        //                 />
        //                 <Line 
        //                   type="monotone" 
        //                   dataKey="score" 
        //                   stroke="#8B5CF6" 
        //                   strokeWidth={3}
        //                   dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
        //                 />
        //               </LineChart>
        //             </ResponsiveContainer>
        //           </div>
                  
        //           <div className="grid grid-cols-2 gap-4 mb-6">
        //             <div className="bg-black/20 rounded-lg p-4">
        //               <div className="text-2xl font-bold text-white">{user.current_streak}</div>
        //               <div className="text-gray-400">Day Streak</div>
        //             </div>
        //             <div className="bg-black/20 rounded-lg p-4">
        //               <div className="text-2xl font-bold text-white">{user.lastUpdated}</div>
        //               <div className="text-gray-400">Last Active</div>
        //             </div>
        //           </div>
                  
        //           <button
        //             onClick={() => setactiveUserId(null)}
        //             className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all"
        //           >
        //             Close
        //           </button>
        //         </>
        //       );
        //     })()}
        //   </div>
        // </div>
      )}
    </div>
  );
};

export default FitnessLeaderboard;