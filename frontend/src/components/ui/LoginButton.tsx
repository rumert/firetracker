"use client";

import React from 'react'
import { useFormStatus } from 'react-dom';
import { Button, buttonVariants } from './button';
import { Loader2 } from 'lucide-react';

export default function LoginButton({ children, pendingText, variant, size, className }: any) {
    const { pending } = useFormStatus();
    
    return pending ? (
        <Button aria-disabled={true} className={className}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </Button> 
    ) : (
        <Button className={buttonVariants({ variant, size, className })} type="submit">
          { children }
        </Button>
    )
}
