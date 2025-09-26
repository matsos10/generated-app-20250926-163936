import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, User, Bot, Smile, Frown, Meh, Send } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { Ticket, TicketStatus, TicketSentiment } from '../../../worker/types';
import { format, parseISO } from 'date-fns';
const statusVariant = {
  'Open': 'destructive',
  'In Progress': 'secondary',
  'Closed': 'default',
} as const;
const priorityVariant = {
  'High': 'destructive',
  'Medium': 'secondary',
  'Low': 'outline',
} as const;
const sentimentIcon: Record<TicketSentiment, React.ReactNode> = {
  Positive: <Smile className="h-5 w-5 text-green-500" />,
  Neutral: <Meh className="h-5 w-5 text-yellow-500" />,
  Negative: <Frown className="h-5 w-5 text-red-500" />,
};
export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}`);
      const result = await response.json();
      if (result.success) {
        setTicket(result.data);
        setNewStatus(result.data.status);
      } else {
        toast.error('Failed to load ticket details.');
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      toast.error('An error occurred while fetching the ticket.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);
  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);
  const handleStatusUpdate = async () => {
    if (!ticketId || !newStatus || newStatus === ticket?.status) return;
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setTicket(result.data);
        toast.success('Ticket status updated successfully!');
      } else {
        toast.error('Failed to update ticket status.');
      }
    } catch (error) {
      toast.error('An error occurred while updating the status.');
    }
  };
  const handleCommentSubmit = async () => {
    if (!ticketId || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });
      const result = await response.json();
      if (result.success) {
        setTicket(result.data);
        setNewComment('');
        toast.success('Reply sent successfully!');
      } else {
        toast.error(result.error || 'Failed to send reply.');
      }
    } catch (error) {
      toast.error('An error occurred while sending the reply.');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Ticket not found</h2>
        <p className="text-muted-foreground">The requested ticket could not be found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/dashboard/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <>
      <Toaster richColors />
      <div className="space-y-6">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/dashboard/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground">Ticket ID: {ticket.id}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.conversation?.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      {entry.author === 'User' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{entry.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(entry.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <div className="w-full flex items-center gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    className="flex-1"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmittingComment}
                  />
                  <Button onClick={handleCommentSubmit} disabled={!newComment.trim() || isSubmittingComment}>
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Priority</span>
                  <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sentiment</span>
                  {sentimentIcon[ticket.sentiment]}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Update</span>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(ticket.lastUpdate), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="status">Change Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TicketStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter>
                <Button onClick={handleStatusUpdate} className="w-full" disabled={newStatus === ticket.status}>
                  Update Status
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}