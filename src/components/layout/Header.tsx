import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
export function Header({
  title
}: {
  title: string;
}) {
  return <header className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex items-center space-x-4">
          
          <div className="h-6 w-px bg-border hidden md:block" />
          <h1 className="text-lg font-semibold hidden md:block">{title}</h1>
        </div>
        <div className="flex-1 flex justify-center md:justify-start md:ml-4">
          <h1 className="text-lg font-semibold md:hidden">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="bg-gradient-to-r from-[#e1f5fe]/50 to-[#e7f5fa]/50">
            Ayuda
          </Button>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-[#6EC1E4] text-white">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>;
}