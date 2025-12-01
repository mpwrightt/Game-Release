'use client';

import { SignIn } from '@clerk/nextjs';
import { Gamepad2 } from 'lucide-react';

export function AuthForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Game Watchlist</h1>
          <p className="text-muted-foreground mt-2">
            Track upcoming game releases
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
