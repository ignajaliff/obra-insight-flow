
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header({ title }: { title: string }) {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Ayuda
          </Button>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-brand-600 text-white">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
