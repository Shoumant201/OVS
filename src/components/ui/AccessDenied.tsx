import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AccessDeniedDialogProps {
  open: boolean;
  onClose: () => void;
}

const AccessDeniedDialog: React.FC<AccessDeniedDialogProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Access Denied
        </DialogTitle>
        <DialogDescription>
          You do not have the necessary permissions to access this page.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex justify-end mt-4">
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AccessDeniedDialog;
