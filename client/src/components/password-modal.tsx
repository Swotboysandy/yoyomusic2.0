import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  roomName: string;
}

export default function PasswordModal({ isOpen, onClose, onSubmit, roomName }: PasswordModalProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(password);
    setPassword("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-dark-200 to-dark-100 border-gray-800/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Room Password Required</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-400">
            "{roomName}" is password protected. Please enter the password to join.
          </p>
          
          <Input
            type="password"
            placeholder="Enter room password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-dark-300 border-gray-700 text-white placeholder-gray-400"
            autoFocus
          />
          
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white"
            >
              Join Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
