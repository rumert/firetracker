"use client";

import React from 'react'
import { useFormStatus } from 'react-dom';
import { Button, buttonVariants } from './button';
import { Loader2 } from 'lucide-react';

export default function SubmitButton({ children, pendingText, variant, size, className, cy }: any) {
    const { pending } = useFormStatus();
    
    return pending ? (
        <Button aria-disabled={true} variant={variant} size={size} className={className}>
          <Loader2 className={`${pendingText ? 'mr-2' : ''} h-4 w-4 animate-spin`} />
          {pendingText}
        </Button> 
    ) : (
        <Button type="submit" variant={variant} size={size} className={className} data-cy={cy}>
          { children }
        </Button>
    )
}