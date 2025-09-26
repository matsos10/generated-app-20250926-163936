import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Activity, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const stats = [
    { title: 'Open Tickets', value: '125', icon: MessageSquare, change: '+5.2%' },
    { title: 'Resolved Today', value: '42', icon: CheckCircle, change: '+12.1%' },
    { title: 'Active Users', value: '8,421', icon: Users, change: '+2.1%' },
    { title: 'Avg. Response Time', value: '2.1h', icon: Activity, change: '-3.4%' },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your support desk.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-[60vh]">
        <ChatInterface />
      </div>
    </div>
  );
}