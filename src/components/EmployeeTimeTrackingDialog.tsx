
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Clock, ExternalLink, Smartphone } from 'lucide-react';

interface EmployeeTimeTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeTimeTrackingDialog = ({ open, onOpenChange }: EmployeeTimeTrackingDialogProps) => {
  const portalUrl = `${window.location.origin}/employee-portal`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalUrl);
    alert('Portal link copied to clipboard!');
  };

  const openPortal = () => {
    window.open('/employee-portal', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Employee Time Portal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Share this link with your employees
            </h3>
            <p className="text-gray-600 text-sm">
              Employees can securely submit their work hours using their phone number and SMS verification.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Portal URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={portalUrl}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">How it works:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Employee enters their phone number</li>
              <li>• System sends SMS with 6-digit code</li>
              <li>• Employee enters verification code</li>
              <li>• Employee submits start/end times and job</li>
              <li>• You review and approve in Time Logs</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={openPortal}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Portal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
