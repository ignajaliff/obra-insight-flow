
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { CheckIcon, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanySelectorProps {
  companies: string[];
  selectedCompany: string | null;
  onSelect: (company: string | null) => void;
}

export function CompanySelector({ companies, selectedCompany, onSelect }: CompanySelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>
            {selectedCompany ? selectedCompany : "Todas las empresas"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup>
            <CommandItem 
              onSelect={() => onSelect(null)}
              className="flex items-center gap-2"
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-sm border",
                selectedCompany === null ? "bg-primary border-primary" : "border-muted"
              )}>
                {selectedCompany === null && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
              </div>
              Todas las empresas
            </CommandItem>
            
            {companies.map((company) => (
              <CommandItem 
                key={company}
                value={company}
                onSelect={() => onSelect(company)}
                className="flex items-center gap-2"
              >
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-sm border",
                  selectedCompany === company ? "bg-primary border-primary" : "border-muted"
                )}>
                  {selectedCompany === company && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
                </div>
                {company}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
