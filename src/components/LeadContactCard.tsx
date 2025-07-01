
import React from 'react';
import { Phone, Mail, Calendar, DollarSign, FileText, MapPin } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Lead } from '@/hooks/useLeads';
import { StatusBadge } from './StatusBadge';

interface LeadContactCardProps {
  lead: Lead;
  children: React.ReactNode;
}

export const LeadContactCard = ({ lead, children }: LeadContactCardProps) => {
  const handleCall = () => {
    window.open(`tel:${lead.phone}`, '_self');
  };

  const handleEmail = () => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_self');
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{lead.name}</h4>
              <p className="text-sm text-gray-600 capitalize">
                {lead.source.replace('_', ' ')} Lead
              </p>
            </div>
            <StatusBadge status={lead.status} variant="lead" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {lead.phone}
              </div>
              <Button variant="outline" size="sm" onClick={handleCall}>
                Call
              </Button>
            </div>

            {lead.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {lead.email}
                </div>
                <Button variant="outline" size="sm" onClick={handleEmail}>
                  Email
                </Button>
              </div>
            )}

            {lead.follow_up_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Follow up: {lead.follow_up_date}
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Lead Cost: ${(lead.lead_cost || 0).toLocaleString()}
            </div>

            {lead.notes && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Notes:</p>
                    <p className="mt-1">{lead.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(lead.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
