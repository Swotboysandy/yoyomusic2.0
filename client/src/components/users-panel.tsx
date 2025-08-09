interface RoomUser {
  id: string;
  userId: string;
  isTyping: boolean;
  lastActivity: string;
  user?: { username: string };
}

interface UsersPanelProps {
  users: RoomUser[];
}

export default function UsersPanel({ users }: UsersPanelProps) {
  const getAvatarColor = (userId: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const getActivityStatus = (user: RoomUser) => {
    if (user.isTyping) {
      return { icon: 'fa-keyboard', text: 'Typing', color: 'text-blue-400' };
    }
    return { icon: 'fa-circle', text: 'Online', color: 'text-primary' };
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl shadow-purple-500/10">
      <h3 className="text-lg font-bold mb-4 text-white">Listeners</h3>
      
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-users text-2xl mb-2"></i>
            <p>No users online</p>
          </div>
        ) : (
          users.map((user) => {
            const status = getActivityStatus(user);
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getAvatarColor(user.userId)} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
                    {getInitials(user.user?.username || 'U')}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{user.user?.username || 'Unknown User'}</p>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-xs ${status.color}`}>
                  <i className={`fas ${status.icon}`}></i>
                  <span>{status.text}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
