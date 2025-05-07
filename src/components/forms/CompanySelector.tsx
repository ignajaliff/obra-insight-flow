
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { CheckIcon, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectSelectorProps {
  projects: string[];
  selectedProject: string | null;
  onSelect: (project: string | null) => void;
}

export function ProjectSelector({ projects = [], selectedProject, onSelect }: ProjectSelectorProps) {
  // Ensure projects is always an array, even if undefined is passed
  const safeProjects = Array.isArray(projects) ? projects : [];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>
            {selectedProject ? selectedProject : "Todos los proyectos"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Buscar proyecto..." />
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup>
            <CommandItem 
              onSelect={() => onSelect(null)}
              className="flex items-center gap-2"
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-sm border",
                selectedProject === null ? "bg-primary border-primary" : "border-muted"
              )}>
                {selectedProject === null && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
              </div>
              Todos los proyectos
            </CommandItem>
            
            {safeProjects.map((project) => (
              <CommandItem 
                key={project}
                value={project}
                onSelect={() => onSelect(project)}
                className="flex items-center gap-2"
              >
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-sm border",
                  selectedProject === project ? "bg-primary border-primary" : "border-muted"
                )}>
                  {selectedProject === project && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
                </div>
                {project}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
