import { useApp } from "@/context/AppContext";
import { format } from "date-fns";
import { useState } from "react";
import {
  BookOpen, Calendar, ExternalLink, Plus, Trash2, Users, ChevronDown, ChevronUp, GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateAssignmentDialog } from "@/components/dashboard/CreateAssignmentDialog";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export function AdminDashboard() {
  const { currentUser, assignments, submissions, users, getAssignmentSubmissions, deleteAssignment, reorderAssignments } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!currentUser) return null;

  const myAssignments = assignments.filter((a) => a.createdBy === currentUser.id);
  const students = users.filter((u) => u.role === "student");
  const totalStudents = students.length;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // Map from filtered index to full array index
    const sourceIdx = assignments.indexOf(myAssignments[result.source.index]);
    const destIdx = assignments.indexOf(myAssignments[result.destination.index]);
    if (sourceIdx >= 0 && destIdx >= 0) {
      reorderAssignments(sourceIdx, destIdx);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Assignments</h1>
          <p className="text-muted-foreground mt-1">
            {myAssignments.length} assignment{myAssignments.length !== 1 ? "s" : ""} · {totalStudents} student{totalStudents !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateAssignmentDialog />
      </div>

      <AnalyticsPanel />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="assignments">
          {(provided) => (
            <div className="grid gap-4" ref={provided.innerRef} {...provided.droppableProps}>
              {myAssignments.map((assignment, index) => {
                const subs = getAssignmentSubmissions(assignment.id);
                const submittedCount = subs.filter((s) => s.submitted).length;
                const progress = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
                const isExpanded = expanded === assignment.id;

                return (
                  <Draggable key={assignment.id} draggableId={assignment.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`glass-card rounded-lg overflow-hidden transition-shadow ${
                          snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30" : ""
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 self-start pt-0.5"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                                <h3 className="font-semibold truncate">{assignment.title}</h3>
                                <Badge variant="secondary" className="text-xs">{assignment.course}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {assignment.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 flex-wrap">
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Due {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                                </span>
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

                            <div className="flex items-center gap-2 shrink-0">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{assignment.title}" and all submission records.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteAssignment(assignment.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-1.5 text-xs font-medium">
                                <Users className="h-3.5 w-3.5" />
                                Submissions
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {submittedCount} / {totalStudents}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <button
                            onClick={() => setExpanded(isExpanded ? null : assignment.id)}
                            className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            {isExpanded ? "Hide" : "View"} student details
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="border-t bg-muted/30 px-5 py-3 animate-fade-in">
                            <div className="grid gap-2">
                              {students.map((student) => {
                                const sub = subs.find((s) => s.studentId === student.id);
                                const didSubmit = sub?.submitted ?? false;
                                return (
                                  <div
                                    key={student.id}
                                    className="flex items-center justify-between py-1.5 text-sm"
                                  >
                                    <span className="truncate">{student.name}</span>
                                    {didSubmit ? (
                                      <Badge className="bg-success text-success-foreground text-xs">
                                        Submitted
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs text-muted-foreground">
                                        Not submitted
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                              {students.length === 0 && (
                                <p className="text-xs text-muted-foreground py-2">No students registered yet.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {myAssignments.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Plus className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No assignments yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
