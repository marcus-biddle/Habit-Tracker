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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type AlertDialogButtonProps = {
  buttonText: string;
  type?: "button" | "submit" | "reset" | undefined;
  dialogTitle?: string;
  dialingDesc: string;
  formRef: React.RefObject<HTMLFormElement | null>
}

export function AlertDialogButton({
  buttonText,
  type=undefined,
  dialogTitle='Are you absolutely sure?',
  dialingDesc,
  formRef
}: AlertDialogButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full">{buttonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialingDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => formRef.current?.requestSubmit()}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}