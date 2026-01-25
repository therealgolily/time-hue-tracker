import { Building2 } from 'lucide-react';
import { businessInfo } from '../data/businessData';
import { useClients } from '../hooks/useClients';

export const BusinessProfile = () => {
  const { clients, loading } = useClients();

  const monthlyRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Business Profile</h1>
        <p className="text-muted-foreground mt-1">Company information</p>
      </div>

      <div className="bg-primary text-primary-foreground rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">{businessInfo.companyName}</h2>
            <p className="text-primary-foreground/70">{businessInfo.type}</p>
          </div>
        </div>
        <p className="text-primary-foreground/60">State: {businessInfo.state}</p>
        <p className="text-primary-foreground/60 mt-2">Monthly Revenue: ${monthlyRevenue.toLocaleString()}</p>
      </div>
    </div>
  );
};
