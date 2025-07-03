
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useLeads } from '@/hooks/useLeads';

interface LeadNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    name: string;
    notes?: string;
  };
}

export const LeadNotesDialog: React.FC<LeadNotesDialogProps> = ({ 
  open, 
  onOpenChange, 
  lead 
}) => {
  const [notes, setNotes] = useState(lead.notes || '');
  const { updateLead, isUpdatingLead } = useLeads();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentDate = new Date().toLocaleString();
    const newNote = `[${currentDate}] ${notes}`;
    const updatedNotes = lead.notes 
      ? `${lead.notes}\n\n${newNote}`
      : newNote;

    updateLead({ 
      id: lead.id, 
      updates: { notes: updatedNotes } 
    });

    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note for {lead.name}</DialogTitle>
        </DialogHeader>
        
        {lead.notes && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">Previous Notes:</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-md border max-h-40 overflow-y-auto">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</pre>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="notes">New Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your conversation notes here..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isUpdatingLead || !notes.trim()}>
              {isUpdatingLead ? 'Adding...' : 'Add Note'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
