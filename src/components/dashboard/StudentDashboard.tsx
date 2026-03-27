import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { BookOpen, Calendar, ExternalLink, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SubmitDialog } from "@/components/dashboard/SubmitDialog";
import { DeadlineCountdown } from "@/components/dashboard/DeadlineCountdown";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";

export function StudentDashboard() {
  const { currentUser, assignments, getStudentSubmissions, streak } = useApp();
  if (!currentUser) return null;

  const mySubmissions = getStudentSubmissions(currentUser.id);
  const submittedCount = mySubmissions.filter((s) => s.submitted).length;
  const totalCount = assignments.length;
  const progress = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const getSubmission = (assignmentId: string) =>
    mySubmissions.find((s) => s.assignmentId === assignmentId);

  const isPastDue = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Assignments</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {currentUser.name.split(" ")[0]}
        </p>
      </div>

      {/* Streak + Progress row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakTracker streak={streak} />
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {submittedCount}/{totalCount}
            </span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-1.5">{progress}% complete</p>
        </div>
      </div>

      {/* Analytics */}
      <AnalyticsPanel />

      {/* Assignment list */}
      <div className="grid gap-4">
        {assignments.map((assignment) => {
          const sub = getSubmission(assignment.id);
          const submitted = sub?.submitted ?? false;
          const pastDue = isPastDue(assignment.dueDate);

          return (
            <div
              key={assignment.id}
              className="glass-card rounded-lg p-5 transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-semibold truncate">{assignment.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {assignment.course}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {assignment.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                    </span>
                    <DeadlineCountdown dueDate={assignment.dueDate} submitted={submitted} />
                    {pastDue && !submitted && (
                      <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Past due
                      </span>
                    )}
                    {assignment.driveLink && (
                      <a
                        href={assignment.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Drive Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  {submitted ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Submitted</span>
                    </div>
                  ) : (
                    <SubmitDialog assignmentTitle={assignment.title} assignmentId={assignment.id} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Circle className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No assignments yet</p>
        </div>
      )}
    </div>
  );
}
