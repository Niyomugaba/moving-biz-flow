
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Website = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
              alt="Bantu Movers Logo" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Bantu Movers</CardTitle>
          <p className="text-muted-foreground">Portal Access</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/manager-login')} 
            className="w-full h-12 gap-3"
            size="lg"
          >
            <Shield className="h-5 w-5" />
            Manager Portal
          </Button>
          
          <Button 
            onClick={() => navigate('/employee-portal')} 
            variant="outline" 
            className="w-full h-12 gap-3"
            size="lg"
          >
            <Users className="h-5 w-5" />
            Employee Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Website;
