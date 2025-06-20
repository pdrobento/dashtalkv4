import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  attendantName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  attendantName,
  isLoading = false,
}: DeleteConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#19191C] border-[#333] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Tem certeza que deseja excluir o atendente{" "}
            <span className="font-semibold text-white">"{attendantName}"</span>?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-transparent border-[#333] text-gray-300 hover:bg-[#222] hover:text-white"
            disabled={isLoading}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#FF4242] hover:bg-[#FF6B6B] text-white border-none"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
