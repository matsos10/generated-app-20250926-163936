import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Smile, Frown, Meh } from "lucide-react";
import type { Ticket, TicketSentiment } from "../../../worker/types";
import { NewTicketDialog } from "@/components/dashboard/NewTicketDialog";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tickets');
      const result = await response.json();
      if (result.success) {
        setTickets(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  const handleRowClick = (ticketId: string) => {
    navigate(`/dashboard/tickets/${ticketId}`);
  };
  return (
    <>
      <Toaster richColors />
      <NewTicketDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onTicketCreated={fetchTickets}
      />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">Manage and respond to customer inquiries.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>A list of all support tickets in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        onClick={() => handleRowClick(ticket.id)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>{sentimentIcon[ticket.sentiment]}</TooltipTrigger>
                              <TooltipContent>
                                <p>{ticket.sentiment}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>{ticket.lastUpdate}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No tickets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}