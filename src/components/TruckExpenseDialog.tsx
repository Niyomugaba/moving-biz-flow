
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Job } from '@/hooks/useJobs';

interface TruckExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSave: (expenses: { rentalCost: number; gasCost: number }) => void;
}

export const TruckExpenseDialog = ({ open, onOpenChange, job, onSave }: TruckExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    rentalCost: job?.truck_rental_cost?.toString() || '',
    gasCost: job?.truck_gas_cost?.toString() || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rentalCost = parseFloat(formData.rentalCost) || 0;
    const gasCost = parseFloat(formData.gasCost) || 0;
    
    onSave({ rentalCost, gasCost });
    onOpenChange(false);
  };

  if (!job || !job.truck_service_fee) return null;

  const totalExpenses = (parseFloat(formData.rentalCost) || 0) + (parseFloat(formData.gasCost) || 0);
  const truckProfit = 90 - totalExpenses;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Truck Expenses - {job.client_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Truck service fee charged:</span>
                <span className="font-medium">$90.00</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Truck Rental Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.rentalCost}
              onChange={(e) => setFormData({ ...formData, rentalCost: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gas Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.gasCost}
              onChange={(e) => setFormData({ ...formData, gasCost: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total expenses:</span>
                <span className="font-medium">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-medium text-gray-900">Truck profit:</span>
                <span className={`font-bold ${truckProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${truckProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Expenses
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
