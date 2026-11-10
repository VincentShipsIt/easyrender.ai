'use client';

import type { ReactNode } from 'react';
import { AuthFields, type AuthMode } from '@/components/auth-fields';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AuthDialog({
  open,
  onOpenChange,
  onDone,
  title,
  description,
  children,
  defaultMode = 'sign-up',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void | Promise<void>;
  title: string;
  description: string;
  children?: ReactNode;
  defaultMode?: AuthMode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <Tabs defaultValue={defaultMode} className="gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="sign-up">Sign up</TabsTrigger>
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-up">
            <AuthFields mode="sign-up" onDone={onDone} submitLabel="Create account and continue" />
          </TabsContent>
          <TabsContent value="sign-in">
            <AuthFields mode="sign-in" onDone={onDone} submitLabel="Sign in and continue" />
          </TabsContent>
        </Tabs>
        <p className="text-center text-xs text-muted-foreground">
          Free previews every day. No credit card needed.
        </p>
      </DialogContent>
    </Dialog>
  );
}
