import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
export function ProfilePage() {
  const { user, setUser } = useStore();
  const nameRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value;
    const avatarUrl = avatarRef.current?.value;
    if (name) {
      setUser(name, avatarUrl);
      toast.success('Profile updated!');
    } else {
      toast.error('Name cannot be empty.');
    }
  };
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="retro-card">
        <CardHeader>
          <CardTitle className="text-4xl text-retro-gold">Your Royal Profile</CardTitle>
          <CardDescription className="text-xl text-retro-gold/80">
            Customize your presence in Harmonia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32 border-4 border-primary">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <p className="text-2xl text-retro-white">{user.name}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-2xl text-retro-gold">Display Name</Label>
              <Input
                id="displayName"
                ref={nameRef}
                defaultValue={user.name}
                className="h-14 text-lg bg-background text-retro-white placeholder:text-retro-gold/70 focus-visible:ring-offset-0 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-2xl text-retro-gold">Avatar URL</Label>
              <Input
                id="avatarUrl"
                ref={avatarRef}
                defaultValue={user.avatarUrl}
                placeholder="https://..."
                className="h-14 text-lg bg-background text-retro-white placeholder:text-retro-gold/70 focus-visible:ring-offset-0 focus-visible:ring-2"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full py-6 text-2xl retro-btn bg-retro-gold text-retro-black hover:bg-background hover:text-retro-gold"
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}