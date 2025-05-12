
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectSelectorProps {
  projects: string[];
  selectedProject: string;
  onProjectChange: (value: string) => void;
}

export function ProjectSelector({ 
  projects, 
  selectedProject, 
  onProjectChange 
}: ProjectSelectorProps) {
  return (
    <Tabs 
      defaultValue={projects[0] || 'Todos'} 
      value={selectedProject} 
      onValueChange={onProjectChange}
    >
      <TabsList className="w-full flex justify-start mb-6 overflow-x-auto bg-secondary/30 p-2 rounded-lg">
        {projects.map(project => (
          <TabsTrigger 
            key={project} 
            value={project} 
            className="whitespace-nowrap text-base py-3 px-6 font-medium data-[state=active]:bg-[#1A4B7C] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            {project}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
