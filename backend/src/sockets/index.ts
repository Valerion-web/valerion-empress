import { Server } from 'socket.io';

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('join-room', (room: string) => socket.join(room));
    socket.on('notification', (payload) => io.to('notifications').emit('notification', payload));
    socket.on('leave-approval', (payload) => io.to('leave-approvals').emit('leave-approval', payload));
    socket.on('helpdesk', (payload) => io.to('helpdesk').emit('helpdesk', payload));
    socket.on('announcement', (payload) => io.to('announcements').emit('announcement', payload));
  });
};
