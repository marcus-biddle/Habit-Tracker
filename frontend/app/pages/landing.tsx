import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Target, TrendingUp, Calendar, BarChart3, CheckCircle2, ArrowRight, Flame } from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Habit Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build Better Habits,
              <br />
              <span className="text-primary">One Day at a Time</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your progress, maintain consistency, and achieve your goals with our
              comprehensive habit tracking platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8">
                    Start Tracking Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Tracking</h3>
            <p className="text-muted-foreground">
              Log your habits quickly with our intuitive interface. Track multiple habits
              and see your progress at a glance.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Visual Analytics</h3>
            <p className="text-muted-foreground">
              View detailed charts and statistics to understand your patterns and identify
              areas for improvement.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Streak Tracking</h3>
            <p className="text-muted-foreground">
              Build consistency with streak tracking. See your longest streaks and stay
              motivated to keep going.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Flexible Scheduling</h3>
            <p className="text-muted-foreground">
              Set daily, weekly, or monthly goals. Organize habits into groups and customize
              your tracking experience.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Progress Insights</h3>
            <p className="text-muted-foreground">
              Get insights into your habit performance with weekly and monthly statistics.
              Understand what works for you.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Goal Setting</h3>
            <p className="text-muted-foreground">
              Set specific targets for each habit and track your progress toward achieving
              your goals.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-24 p-8 rounded-lg border bg-card text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Build Better Habits?</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of users who are already tracking their habits and achieving
            their goals.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-24 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold">Habit Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Habit Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

