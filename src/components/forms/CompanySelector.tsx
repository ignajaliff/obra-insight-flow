
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Company } from '@/types/forms';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onSelect: (companyId: string | null) => void;
}

export function CompanySelector({ companies, selectedCompanyId, onSelect }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCompany = selectedCompanyId 
    ? companies.find(company => company.id === selectedCompanyId) 
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[260px] justify-between"
        >
          {selectedCompany ? selectedCompany.name : "Seleccionar empresa"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandEmpty>No se encontraron empresas.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              key="all-companies"
              onSelect={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="justify-between"
            >
              Todas las empresas
              {selectedCompanyId === null && <Check className="h-4 w-4" />}
            </CommandItem>
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                onSelect={() => {
                  onSelect(company.id);
                  setOpen(false);
                }}
                className="justify-between"
              >
                {company.name}
                {selectedCompanyId === company.id && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
