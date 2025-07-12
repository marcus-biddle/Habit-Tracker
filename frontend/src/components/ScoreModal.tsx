import { useState } from 'react'
import { categories } from '../concept/FitnessLeaderboard';

interface ScoreModalProps {
    setOpen: (show: boolean) => void;
  }

export const ScoreModal = ({ setOpen }: ScoreModalProps) => {
    const [submitForm, setSubmitForm] = useState({ name: '', score: '', category: 'pushups' });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // In a real app, this would submit to your backend
        console.log('Submitting score:', submitForm);
        setOpen(false);
        setSubmitForm({ name: '', score: '', category: 'pushups' });
      };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Submit Your Score</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={submitForm.name}
                  onChange={(e) => setSubmitForm({...submitForm, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  value={submitForm.category}
                  onChange={(e) => setSubmitForm({...submitForm, category: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key} className="bg-gray-800">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Score</label>
                <input
                  type="number"
                  value={submitForm.score}
                  onChange={(e) => setSubmitForm({...submitForm, score: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your score"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
  )
}
