import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketManagerService {
  private clients = new Map<string, string[]>();

  registerClient(userId: string, clientId: string) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).push(clientId);
    } else {
      this.clients.set(userId, [clientId]);
    }
	// console.log(`Client ${clientId} registered for User ${userId}`);
  //   console.log('Current state:', this.clients);
  }

  unregisterClient(client: Socket) {
    let userId = Array.from(this.clients.keys()).find(key => this.clients.get(key).includes(client.id));
    
    if (userId) {
      this.clients.set(userId, this.clients.get(userId).filter(id => id !== client.id));
      
      if (this.clients.get(userId).length === 0) {
        this.clients.delete(userId);
      }
    }
	// console.log(`Client ${client.id} unregistered for User ${userId}`);
  //   console.log('Current state:', this.clients);
  }

  getClients(userId: string) {
    return this.clients.get(userId) || [];
  }

  getUserIdBySocketId(socketId: string): string {
    for (const [userId, socketIds] of this.clients.entries()) {
      if (socketIds.includes(socketId)) {
        return userId;
      }
    }
    return null;
  }

  getAllClients() {
    let allClientsArray = [];
    for (const [userId, clientIds] of this.clients.entries()) {
      allClientsArray.push({
        userId: userId,
        clientIds: clientIds
      });
    }
    return allClientsArray;
  }
}
