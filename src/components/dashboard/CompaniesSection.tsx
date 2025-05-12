import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, FileText } from 'lucide-react';
interface ProjectWithFormTypes {
  proyecto: string;
  formTypes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  formCount?: number;
}
interface ProjectsSectionProps {
  projects: ProjectWithFormTypes[];
  isLoading: boolean;
}
export function ProjectsSection({
  projects,
  isLoading
}: ProjectsSectionProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }
  return;
}