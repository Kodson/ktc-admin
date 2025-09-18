import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import ktcLogo from '../src/media/klogo.png';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  const handleQuickLogin = async (userType: 'super_admin' | 'admin' | 'station_manager') => {
    setError('');
    
    const credentials = {
      super_admin: { username: 'I.T', password: '0040105715@Icon' },
      admin: { username: 'FAM', password: 'admin123' },
      station_manager: { username: 'Mr Amoah', password: 'Amoah@2025' }
    };

    try {
      await login(credentials[userType].username, credentials[userType].password);
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-6 flex flex-col items-center">
            <img 
              src={ktcLogo} 
              alt="KTC Energy Logo" 
              className="h-16 w-auto mb-3"
            />
            <p className="text-muted-foreground text-lg">Fuel Station Management System</p>
          </div>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Login Buttons for Development */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-3">Quick Login (Development)</p>
            </div>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => handleQuickLogin('super_admin')}
                disabled={isLoading}
                className="w-full bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
              >
                Login as Super Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
                className="w-full bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
              >
                Login as Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickLogin('station_manager')}
                disabled={isLoading}
                className="w-full bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
              >
                Login as Station Manager
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
            <p className="font-medium">Demo credentials:</p>
            <p>Super Admin: I.T</p>
            <p>Admin: admin</p>
            <p>Manager: manager</p>
            <p>Password: 0040105715@Icon (for I.T) or password123 (for others)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}