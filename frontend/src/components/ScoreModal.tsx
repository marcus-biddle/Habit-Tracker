import React, { useState } from 'react';
import { Calendar, Users, Trophy, Trash2, Save, Dumbbell } from 'lucide-react';
import { SHEET_NAMES, type LeaderboardData } from './GoogleSheetsModal';
import { GoogleSheetApi } from '../api/supabase';

interface ScoreModalProps {
  leaderboardData: LeaderboardData;
  selectedSheet: string;
  setSelectedSheet: (sheet: string) => void;
  isOpen: (graph: boolean) => void;
  setSelectedPerson: (person: string) => void;
}

export const ScoreModal = ({ leaderboardData, selectedSheet, setSelectedSheet, isOpen, setSelectedPerson }: ScoreModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [score, setScore] = useState('');
  const [operation, setOperation] = useState<'update' | 'delete'>('update'); // 'update', 'delete'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
  setIsSubmitting(true);

  try {
    // Validate inputs
    if (!selectedDate || !selectedUser) {
      throw new Error('Please select a date and user');
    }

    if (operation === 'update' && !score) {
      throw new Error('Please enter a score');
    }

    console.log('starting api call');
    // Perform update or delete
    const updateAction = await GoogleSheetApi.updateScore({
      sheet: selectedSheet,
      date: selectedDate,
      userName: selectedUser,
      score: operation === 'delete' ? 0 : Number(score),
      operation: operation
    });

    // Clear form
    setScore('');
  } catch (error) {
    console.error(error);
  } finally {
    setIsSubmitting(false);
    isOpen(false); // <- If this closes the modal, consider moving it only on success
  }
};


  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] min-h-0 overflow-y-auto border border-white/10">
        <div className="text-center mb-6">
          <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-blue-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Exercise Tracker</h1>
          <p className="text-gray-400">Update your scores</p>
        </div>

        <div className="space-y-6">
          {/* Sheet Selection */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Dumbbell className="w-4 h-4 mr-2" />
              Select Exercise
            </label>
            <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            required
            >
              <option value="" className="text-gray-400">Choose an exercise...</option>
              {SHEET_NAMES.map(sheet => (
              <option key={sheet.sheet} value={sheet.sheet} className="text-white">
                {sheet.label}
              </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 mr-2" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              required
            />
            {selectedDate && (
              <p className="text-sm text-gray-500">
                Selected: {formatDate(selectedDate)}
              </p>
            )}
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Users className="w-4 h-4 mr-2" />
              Select User
            </label>
            <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setSelectedPerson(e.target.value)
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            required
            >
              <option value="" className="text-gray-400">Choose a user...</option>
              {Object.keys(leaderboardData).map(user => (
              <option key={user} value={user} className="text-white">
                {user}
              </option>
              ))}
            </select>
          </div>

            {/* Operation Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Action
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="operation"
                    value="update"
                    checked={operation === 'update'}
                    onChange={(e) => setOperation(e.target.value as 'update' | 'delete')}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-300">Add/Update Score</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="operation"
                    value="delete"
                    checked={operation === 'delete'}
                    onChange={(e) => setOperation(e.target.value as 'update' | 'delete')}
                    className="mr-2 accent-red-500"
                  />
                  <span className="text-sm text-gray-300">Delete Score</span>
                </label>
              </div>
            </div>

            {/* Score Input */}
            {operation === 'update' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Score
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter number of push-ups"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                operation === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {operation === 'delete' ? (
                    <>
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Score
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Score
                    </>
                  )}
                </div>
              )}
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => isOpen(false)}
              className={'w-full py-3 px-4 rounded-lg font-medium transition-colors border border-blue-600 text-blue-600'}
            >
              Cancel
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="font-medium text-white mb-2">How it works:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Select a date and user from the dropdowns</li>
              <li>• Choose to add/update a score or delete an existing one</li>
              <li>• If the date doesn't exist, a new row will be created</li>
              <li>• If the date exists, the score will be updated or deleted</li>
            </ul>
          </div>
        </div>
      </div>
  );
}
