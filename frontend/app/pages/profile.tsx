import { useEffect, useState } from 'react';
import { supabase } from '../api/client/client';
import { 
  getUserProfile, 
  getAchievements, 
  checkAndUnlockAchievements,
  getPointsForNextLevel,
  getPointsForCurrentLevel,
  type UserProfile,
  type Achievement
} from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Star, Award, TrendingUp, Target, Zap } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const achievementConfig: Record<string, { name: string; description: string; icon: typeof Trophy; color: string }> = {
  first_habit: {
    name: 'First Steps',
    description: 'Created your first habit',
    icon: Star,
    color: 'bg-yellow-500',
  },
  '100_points': {
    name: 'Centurion',
    description: 'Earned 100 points',
    icon: Trophy,
    color: 'bg-blue-500',
  },
  '500_points': {
    name: 'Half Grand',
    description: 'Earned 500 points',
    icon: Trophy,
    color: 'bg-purple-500',
  },
  '7_day_streak': {
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: Zap,
    color: 'bg-orange-500',
  },
  '30_day_streak': {
    name: 'Month Master',
    description: 'Maintained a 30-day streak',
    icon: Award,
    color: 'bg-red-500',
  },
  '10_habits': {
    name: 'Habit Collector',
    description: 'Created 10 habits',
    icon: Target,
    color: 'bg-green-500',
  },
  '100_entries': {
    name: 'Entry Expert',
    description: 'Logged 100 habit entries',
    icon: TrendingUp,
    color: 'bg-indigo-500',
  },
};

export async function clientLoader() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getUserProfile(user.id);
  const achievements = await getAchievements(user.id);
  
  // Check for new achievements
  await checkAndUnlockAchievements(user.id);
  
  // Refresh achievements after checking
  const updatedAchievements = await getAchievements(user.id);

  return {
    user,
    profile,
    achievements: updatedAchievements,
  };
}

export default function Profile({ loaderData }: any) {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(loaderData?.profile ?? null);
  const [achievements, setAchievements] = useState<Achievement[]>(loaderData?.achievements ?? []);

  const user = loaderData?.user || authUser;

  useEffect(() => {
    if (loaderData?.profile) {
      setProfile(loaderData.profile);
    }
    if (loaderData?.achievements) {
      setAchievements(loaderData.achievements);
    }
  }, [loaderData]);

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  const currentLevelPoints = getPointsForCurrentLevel(profile.current_level);
  const nextLevelPoints = getPointsForNextLevel(profile.current_level);
  const progressPoints = profile.total_points - currentLevelPoints;
  const pointsNeeded = nextLevelPoints - currentLevelPoints;
  const progressPercentage = Math.min(100, (progressPoints / pointsNeeded) * 100);

  return (
    <div className="relative h-full flex flex-1 flex-col gap-6 p-4 pt-0 overflow-x-hidden max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Your gamification stats and achievements</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.email} />
              <AvatarFallback className="text-2xl">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.email}</CardTitle>
              <CardDescription>Level {profile.current_level} • {profile.total_points} points</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Level Progress
          </CardTitle>
          <CardDescription>
            Level {profile.current_level} • {progressPoints} / {pointsNeeded} points to Level {profile.current_level + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{currentLevelPoints} pts</span>
            <span>{nextLevelPoints} pts</span>
          </div>
        </CardContent>
      </Card>

      {/* Points Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{profile.total_points}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Earn 10 points for each habit entry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">Level {profile.current_level}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {pointsNeeded - progressPoints} points until next level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            {achievements.length} of {Object.keys(achievementConfig).length} unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No achievements unlocked yet. Keep tracking your habits!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const config = achievementConfig[achievement.achievement_type];
                if (!config) return null;
                
                const Icon = config.icon;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className={`${config.color} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{config.name}</div>
                      <div className="text-sm text-muted-foreground">{config.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
          <CardDescription>Track your progress towards unlocking all achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(achievementConfig).map(([type, config]) => {
              const unlocked = achievements.some(a => a.achievement_type === type);
              const Icon = config.icon;
              
              return (
                <div
                  key={type}
                  className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                    unlocked 
                      ? 'bg-accent' 
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className={`${config.color} p-2 rounded-lg ${!unlocked ? 'opacity-50' : ''}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {config.name}
                      {unlocked && (
                        <Badge variant="default" className="text-xs">Unlocked</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{config.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

