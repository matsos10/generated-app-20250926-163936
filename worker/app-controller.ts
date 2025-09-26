import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, Ticket, UserProfile, TicketStatus } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private tickets = new Map<string, Ticket>();
  private userProfile: UserProfile | null = null;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<SessionInfo | Ticket | UserProfile>();
      for (const [key, value] of stored) {
        if (key.startsWith('session:')) {
          this.sessions.set(key.replace('session:', ''), value as SessionInfo);
        } else if (key.startsWith('ticket:')) {
          this.tickets.set(key.replace('ticket:', ''), value as Ticket);
        } else if (key === 'userProfile') {
          this.userProfile = value as UserProfile;
        }
      }
      // Add mock data if storage is empty
      if (this.tickets.size === 0) {
        this.initializeMockData();
      }
      this.loaded = true;
    }
  }
  private initializeMockData() {
    const now = new Date();
    const mockTickets: Ticket[] = [
      {
        id: 'TKT-001',
        title: 'Login issue on mobile',
        description: 'I cannot log in to my account using the mobile app. It keeps saying "Invalid credentials" but they are correct.',
        status: 'Open',
        priority: 'High',
        sentiment: 'Negative',
        lastUpdate: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
        conversation: [
          { author: 'User', text: 'I cannot log in to my account using the mobile app. It keeps saying "Invalid credentials" but they are correct.', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString() },
          { author: 'AI Assistant', text: 'I understand you\'re having trouble logging in. Have you tried resetting your password?', timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString() }
        ]
      },
      {
        id: 'TKT-002',
        title: 'Billing question',
        description: 'I have a question about my recent invoice. Can you clarify the "Platform Fee" charge?',
        status: 'In Progress',
        priority: 'Medium',
        sentiment: 'Neutral',
        lastUpdate: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        conversation: [
          { author: 'User', text: 'I have a question about my recent invoice. Can you clarify the "Platform Fee" charge?', timestamp: new Date(now.getTime() - 62 * 60 * 1000).toISOString() }
        ]
      },
      {
        id: 'TKT-003',
        title: 'Feature request: Dark mode',
        description: 'The app is great, but a dark mode would be amazing for my eyes, especially at night. Thanks for considering!',
        status: 'Closed',
        priority: 'Low',
        sentiment: 'Positive',
        lastUpdate: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        conversation: [
          { author: 'User', text: 'The app is great, but a dark mode would be amazing for my eyes, especially at night. Thanks for considering!', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString() },
          { author: 'AI Assistant', text: 'Thank you for the suggestion! We\'ve added it to our feature request list. We appreciate your feedback!', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() }
        ]
      },
    ];
    mockTickets.forEach(ticket => this.tickets.set(ticket.id, ticket));
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    this.userProfile = {
      name: 'Demo User',
      email: 'demo@nexusdesk.ai',
      subscriptionStatus: 'Trialing',
      trialEndsAt: trialEndDate.toISOString(),
    };
    this.persistAll();
  }
  private async persist(key: string, value: any): Promise<void> {
    await this.ctx.storage.put(key, value);
  }
  private async persistAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const [id, session] of this.sessions) {
      promises.push(this.ctx.storage.put(`session:${id}`, session));
    }
    for (const [id, ticket] of this.tickets) {
      promises.push(this.ctx.storage.put(`ticket:${id}`, ticket));
    }
    if (this.userProfile) {
      promises.push(this.ctx.storage.put('userProfile', this.userProfile));
    }
    await Promise.all(promises);
  }
  // Session Management
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    const newSession: SessionInfo = {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    };
    this.sessions.set(sessionId, newSession);
    await this.persist(`session:${sessionId}`, newSession);
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.ctx.storage.delete(`session:${sessionId}`);
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist(`session:${sessionId}`, session);
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist(`session:${sessionId}`, session);
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    const keysToDelete = Array.from(this.sessions.keys()).map(id => `session:${id}`);
    this.sessions.clear();
    await this.ctx.storage.delete(keysToDelete);
    return count;
  }
  // Ticket Management
  async getTickets(): Promise<Ticket[]> {
    await this.ensureLoaded();
    return Array.from(this.tickets.values());
  }
  async getTicketById(id: string): Promise<Ticket | undefined> {
    await this.ensureLoaded();
    return this.tickets.get(id);
  }
  async addTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
    await this.ensureLoaded();
    const newTicket: Ticket = {
      ...ticket,
      id: `TKT-${String(this.tickets.size + 1).padStart(3, '0')}`,
      conversation: [{
        author: 'User',
        text: ticket.description,
        timestamp: new Date().toISOString()
      }]
    };
    this.tickets.set(newTicket.id, newTicket);
    await this.persist(`ticket:${newTicket.id}`, newTicket);
    return newTicket;
  }
  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket | null> {
    await this.ensureLoaded();
    const ticket = this.tickets.get(id);
    if (ticket) {
      ticket.status = status;
      ticket.lastUpdate = new Date().toISOString();
      this.tickets.set(id, ticket);
      await this.persist(`ticket:${id}`, ticket);
      return ticket;
    }
    return null;
  }
  async addCommentToTicket(id: string, text: string, author: string): Promise<Ticket | null> {
    await this.ensureLoaded();
    const ticket = this.tickets.get(id);
    if (ticket) {
      if (!ticket.conversation) {
        ticket.conversation = [];
      }
      ticket.conversation.push({
        author,
        text,
        timestamp: new Date().toISOString(),
      });
      ticket.lastUpdate = new Date().toISOString();
      this.tickets.set(id, ticket);
      await this.persist(`ticket:${id}`, ticket);
      return ticket;
    }
    return null;
  }
  // User Profile Management
  async getUserProfile(): Promise<UserProfile | null> {
    await this.ensureLoaded();
    return this.userProfile;
  }
  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    await this.ensureLoaded();
    if (this.userProfile) {
      this.userProfile = { ...this.userProfile, ...profile };
      await this.persist('userProfile', this.userProfile);
      return this.userProfile;
    }
    return null;
  }
}