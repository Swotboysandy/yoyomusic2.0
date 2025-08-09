import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sentAt: string;
  user?: { username: string };
}

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUser: { id: string; username: string };
  typingUsers: { [userId: string]: string };
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function ChatPanel({ 
  messages, 
  currentUser, 
  typingUsers, 
  onSendMessage, 
  onTyping 
}: ChatPanelProps) {
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText("");
      handleStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (userId: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl shadow-purple-500/10">
      <h3 className="text-lg font-bold mb-4 text-white">Room Chat</h3>
      
      {/* Chat Messages */}
      <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-comments text-2xl mb-2"></i>
            <p>No messages yet</p>
            <p className="text-sm text-gray-500">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <div className={`w-6 h-6 ${getAvatarColor(message.userId)} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                {getInitials(message.user?.username || 'U')}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">
                  <span className={`font-medium ${getAvatarColor(message.userId).replace('bg-', 'text-')}`}>
                    {message.user?.username || 'Unknown'}
                  </span>
                  : {message.message}
                </p>
                <p className="text-xs text-gray-500">{formatTime(message.sentAt)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Typing Indicator */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="text-xs text-gray-500 mb-2">
          <i className="fas fa-circle text-primary animate-pulse mr-1"></i>
          {Object.values(typingUsers).join(", ")} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      
      {/* Chat Input */}
      <div className="flex space-x-2">
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 text-sm focus:border-violet-500 font-medium"
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
        >
          <i className="fas fa-paper-plane text-sm"></i>
        </Button>
      </div>
    </div>
  );
}
