import { useState } from "react";
import { useApp } from "@/context/AppContext";
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
import { Button } from "@/components/ui/button";

interface SubmitDialogProps {
  assignmentTitle: string;
  assignmentId: string;
}

export function SubmitDialog({ assignmentTitle, assignmentId }: SubmitDialogProps) {
  const { submitAssignment } = useApp();
  const [step, setStep] = useState<"initial" | "confirm">("initial");
  const [open, setOpen] = useState(false);

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) setStep("initial");
  };

  const handleFirstConfirm = () => setStep("confirm");

  const handleFinalConfirm = () => {
    submitAssignment(assignmentId);
    setOpen(false);
    setStep("initial");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="sm">Mark as Submitted</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="animate-scale-in">
        {step === "initial" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Have you submitted <strong>{assignmentTitle}</strong> via the external link?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleFirstConfirm}>Yes, I have submitted</Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to mark{" "}
                <strong>{assignmentTitle}</strong> as submitted?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinalConfirm}>
                Confirm Submission
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
