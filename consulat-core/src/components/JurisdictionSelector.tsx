import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { MOCK_ENTITIES } from '@/data/mock-entities';
import { COUNTRY_FLAGS } from '@/types/entity';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function JurisdictionSelector() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (entityId: string) => {
    setOpen(false);
    navigate(`/portal/${entityId}`);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-14 text-lg border-2 border-primary/20 hover:border-primary/40 bg-background/80 backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Où résidez-vous ?</span>
            </span>
            <Search className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un pays ou ville..." />
            <CommandList>
              <CommandEmpty>Aucune entité trouvée.</CommandEmpty>
              <CommandGroup heading="Nos représentations">
                {MOCK_ENTITIES.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={`${entity.country} ${entity.city}`}
                    onSelect={() => handleSelect(entity.id)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-2xl">
                      {COUNTRY_FLAGS[entity.countryCode] || '🌍'}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{entity.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {entity.city}, {entity.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
