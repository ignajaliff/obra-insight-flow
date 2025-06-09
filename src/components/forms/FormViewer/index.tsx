
import React, { useState, useEffect } from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { FormSubmissionForm } from './FormSubmissionForm';
import { FormSubmissionComplete } from './FormSubmissionComplete';
import { getDeploymentEnvironment, shouldUseOfflineMode } from '@/utils/deploymentUtils';
import { Wifi, WifiOff } from 'lucide-react';

interface FormViewerProps {
  template: FormTemplate;
  readOnly?: boolean;
  webhookUrl?: string;
}

export function FormViewer({ template, readOnly = false, webhookUrl }: FormViewerProps) {
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'offline'>('connected');
  
  useEffect(() => {
    const deploymentEnv = getDeploymentEnvironment();
    const isOffline = shouldUseOfflineMode();
    
    console.log("🌐 FormViewer - Entorno detectado:", deploymentEnv);
    console.log("📱 Modo offline:", isOffline);
    
    setConnectionStatus(isOffline ? 'offline' : 'connected');
  }, []);
  
  if (!template) {
    return <div className="text-center p-8">Formulario no encontrado</div>;
  }
  
  if (submissionComplete && submissionData) {
    return <FormSubmissionComplete template={template} submissionData={submissionData} />;
  }
  
  return (
    <div className="space-y-4">
      {/* Connection status indicator for FormViewer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {connectionStatus === 'offline' ? (
            <>
              <WifiOff className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 text-sm">
                Modo offline - Los datos se guardan localmente
              </span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm">
                Conectado - Los datos se envían al servidor
              </span>
            </>
          )}
        </div>
      </div>
      
      <Card>
        <FormSubmissionForm
          template={template}
          readOnly={readOnly}
          webhookUrl={webhookUrl}
          setSubmissionComplete={setSubmissionComplete}
          setSubmissionData={setSubmissionData}
        />
      </Card>
    </div>
  );
}
