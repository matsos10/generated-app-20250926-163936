import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import type { Ticket, TicketStatus } from "./types";
import { ChatHandler } from "./chat";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Session Management
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const sessions = await controller.listSessions();
        return c.json({ success: true, data: sessions });
    });
    app.post('/api/sessions', async (c) => {
        const body = await c.req.json().catch(() => ({}));
        const { title, sessionId: providedSessionId, firstMessage } = body;
        const sessionId = providedSessionId || crypto.randomUUID();
        let sessionTitle = title;
        if (!sessionTitle) {
            const now = new Date();
            const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            if (firstMessage && firstMessage.trim()) {
                const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                sessionTitle = `${truncated} • ${dateTime}`;
            } else {
                sessionTitle = `Chat ${dateTime}`;
            }
        }
        await registerSession(c.env, sessionId, sessionTitle);
        return c.json({ success: true, data: { sessionId, title: sessionTitle } });
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        const sessionId = c.req.param('sessionId');
        const deleted = await unregisterSession(c.env, sessionId);
        if (!deleted) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
        return c.json({ success: true, data: { deleted: true } });
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        const sessionId = c.req.param('sessionId');
        const { title } = await c.req.json();
        if (!title) return c.json({ success: false, error: 'Title is required' }, { status: 400 });
        const controller = getAppController(c.env);
        const updated = await controller.updateSessionTitle(sessionId, title);
        if (!updated) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
        return c.json({ success: true, data: { title } });
    });
    app.delete('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const deletedCount = await controller.clearAllSessions();
        return c.json({ success: true, data: { deletedCount } });
    });
    // User Profile
    app.get('/api/user/profile', async (c) => {
        const controller = getAppController(c.env);
        const profile = await controller.getUserProfile();
        return c.json({ success: true, data: profile });
    });
    app.post('/api/user/profile', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const updatedProfile = await controller.updateUserProfile(body);
        return c.json({ success: true, data: updatedProfile });
    });
    // Tickets
    app.get('/api/tickets', async (c) => {
        const controller = getAppController(c.env);
        const tickets = await controller.getTickets();
        return c.json({ success: true, data: tickets });
    });
    app.get('/api/tickets/:ticketId', async (c) => {
        const { ticketId } = c.req.param();
        const controller = getAppController(c.env);
        const ticket = await controller.getTicketById(ticketId);
        if (!ticket) {
            return c.json({ success: false, error: 'Ticket not found' }, 404);
        }
        return c.json({ success: true, data: ticket });
    });
    app.post('/api/tickets/:ticketId/status', async (c) => {
        const { ticketId } = c.req.param();
        const { status } = await c.req.json<{ status: TicketStatus }>();
        if (!['Open', 'In Progress', 'Closed'].includes(status)) {
            return c.json({ success: false, error: 'Invalid status value' }, 400);
        }
        const controller = getAppController(c.env);
        const updatedTicket = await controller.updateTicketStatus(ticketId, status);
        if (!updatedTicket) {
            return c.json({ success: false, error: 'Ticket not found' }, 404);
        }
        return c.json({ success: true, data: updatedTicket });
    });
    app.post('/api/tickets/:ticketId/comments', async (c) => {
        const { ticketId } = c.req.param();
        const { text } = await c.req.json<{ text: string }>();
        if (!text || !text.trim()) {
            return c.json({ success: false, error: 'Comment text is required' }, 400);
        }
        const controller = getAppController(c.env);
        // In a real app, author would come from authenticated user session
        const updatedTicket = await controller.addCommentToTicket(ticketId, text, 'AI Assistant');
        if (!updatedTicket) {
            return c.json({ success: false, error: 'Ticket not found' }, 404);
        }
        return c.json({ success: true, data: updatedTicket });
    });
    app.post('/api/tickets', async (c) => {
        const { title, description } = await c.req.json<{ title: string; description: string }>();
        if (!title || !description) {
            return c.json({ success: false, error: 'Title and description are required' }, 400);
        }
        // Initialize ChatHandler for analysis
        const chatHandler = new ChatHandler(c.env, 'google-ai-studio/gemini-2.5-flash');
        // Get AI analysis
        const analysis = await chatHandler.analyzeTicketContent(title, description);
        const ticketData: Omit<Ticket, 'id'> = {
            title,
            description,
            status: 'Open',
            priority: analysis.priority,
            sentiment: analysis.sentiment,
            lastUpdate: new Date().toISOString(),
        };
        const controller = getAppController(c.env);
        const newTicket = await controller.addTicket(ticketData);
        return c.json({ success: true, data: newTicket }, 201);
    });
    // Analytics (mock data from backend)
    app.get('/api/analytics', (c) => {
        const mockTicketData = [
            { name: 'Mon', new: 30, resolved: 22 }, { name: 'Tue', new: 45, resolved: 35 },
            { name: 'Wed', new: 28, resolved: 40 }, { name: 'Thu', new: 52, resolved: 48 },
            { name: 'Fri', new: 60, resolved: 55 }, { name: 'Sat', new: 38, resolved: 30 },
            { name: 'Sun', new: 25, resolved: 20 },
        ];
        const mockSatisfactionData = [
            { name: 'Excellent', value: 400 }, { name: 'Good', value: 300 },
            { name: 'Neutral', value: 150 }, { name: 'Poor', value: 50 },
        ];
        return c.json({
            success: true,
            data: {
                ticketData: mockTicketData,
                satisfactionData: mockSatisfactionData,
            }
        });
    });
    // Stripe Mock Route
    app.post('/api/stripe/create-checkout-session', async (c) => {
        const { priceId } = await c.req.json<{ priceId: string }>();
        if (!priceId) {
            return c.json({ success: false, error: 'Price ID is required' }, 400);
        }
        const controller = getAppController(c.env);
        // In a real app, you'd create a Stripe session and store the session ID.
        // Here, we'll just update the user's status to 'Active'.
        await controller.updateUserProfile({
            subscriptionStatus: 'Active',
            trialEndsAt: null, // Trial ends once they subscribe
        });
        // Return a mock URL that redirects back to the settings page on "success"
        const mockCheckoutUrl = `/dashboard/settings?subscription_updated=true`;
        return c.json({ success: true, data: { url: mockCheckoutUrl } });
    });
}