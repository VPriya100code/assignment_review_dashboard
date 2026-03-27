import { useApp } from "@/context/AppContext";
import { BarChart3, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function AnalyticsPanel() {
  const { currentUser, assignments, submissions, users } = useApp();

  if (!currentUser) return null;

  if (currentUser.role === "student") {
    return <StudentAnalytics />;
  }
  return <AdminAnalytics />;
}

function StudentAnalytics() {
  const { currentUser, assignments, getStudentSubmissions } = useApp();
  if (!currentUser) return null;

  const mySubs = getStudentSubmissions(currentUser.id);
  const submitted = mySubs.filter((s) => s.submitted).length;
  const total = assignments.length;
  const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  // On-time rate: assignments submitted before due date
  const onTime = mySubs.filter((s) => {
    if (!s.submitted || !s.submittedAt) return false;
    const assignment = assignments.find((a) => a.id === s.assignmentId);
    if (!assignment) return false;
    return new Date(s.submittedAt) <= new Date(assignment.dueDate);
  }).length;
  const onTimeRate = submitted > 0 ? Math.round((onTime / submitted) * 100) : 0;

  // Upcoming deadlines
  const upcoming = assignments
    .filter((a) => {
      const sub = mySubs.find((s) => s.assignmentId === a.id);
      return !sub?.submitted && new Date(a.dueDate) > new Date();
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="glass-card rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Smart Analytics</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          label="Completion"
          value={`${rate}%`}
          detail={`${submitted}/${total}`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="On-time Rate"
          value={`${onTimeRate}%`}
          detail={`${onTime} on time`}
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-warning" />}
          label="Pending"
          value={`${total - submitted}`}
          detail={`${upcoming.length} upcoming`}
        />
      </div>

      {upcoming.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-2">Next deadline:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{upcoming[0].title}</p>
              <p className="text-xs text-muted-foreground">{upcoming[0].course}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminAnalytics() {
  const { currentUser, assignments, submissions, users } = useApp();
  if (!currentUser) return null;

  const myAssignments = assignments.filter((a) => a.createdBy === currentUser.id);
  const students = users.filter((u) => u.role === "student");
  const totalStudents = students.length;

  const totalSubs = myAssignments.reduce((acc, a) => {
    const subs = submissions.filter((s) => s.assignmentId === a.id);
    return acc + subs.filter((s) => s.submitted).length;
  }, 0);
  const totalPossible = myAssignments.length * totalStudents;
  const overallRate = totalPossible > 0 ? Math.round((totalSubs / totalPossible) * 100) : 0;

  // Per-assignment completion
  const assignmentStats = myAssignments.map((a) => {
    const subs = submissions.filter((s) => s.assignmentId === a.id);
    const done = subs.filter((s) => s.submitted).length;
    return { ...a, done, rate: totalStudents > 0 ? Math.round((done / totalStudents) * 100) : 0 };
  });

  return (
    <div className="glass-card rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Class Analytics</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          label="Overall"
          value={`${overallRate}%`}
          detail={`${totalSubs} submitted`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="Assignments"
          value={`${myAssignments.length}`}
          detail="created"
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-warning" />}
          label="Students"
          value={`${totalStudents}`}
          detail="enrolled"
        />
      </div>

      {assignmentStats.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-xs text-muted-foreground">Per-assignment completion:</p>
          {assignmentStats.map((a) => (
            <div key={a.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate max-w-[200px]">{a.title}</span>
                <span className="text-muted-foreground">{a.rate}%</span>
              </div>
              <Progress value={a.rate} className="h-1.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
}
