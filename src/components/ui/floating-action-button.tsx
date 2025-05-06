
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  href?: string;
}

export function FloatingActionButton({ 
  icon, 
  className, 
  href,
  ...props 
}: FloatingActionButtonProps) {
  const buttonContent = (
    <Button
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center",
        className
      )}
      size="icon"
      {...props}
    >
      {icon}
    </Button>
  );
  
  if (href) {
    return (
      <Link to={href}>
        {buttonContent}
      </Link>
    );
  }
  
  return buttonContent;
}
