import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Search, User, X, ChevronDown } from 'lucide-react';
import { useUserManagement } from '../hooks/useUserManagement';
import type { User as UserType } from '../types/userManagement';

interface UserSearchableSelectProps {
  selectedUser: UserType | null;
  onUserSelect: (user: UserType | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  roleFilter?: string;
}

export function UserSearchableSelect({
  selectedUser,
  onUserSelect,
  placeholder = "Search and select a user...",
  disabled = false,
  className = ""
}: UserSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { users, isLoading, refreshData } = useUserManagement();

  // Filter users based on search query and role (only station_manager and admin roles for manager assignment)
  console.log('All users:', users);
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
  const isEligibleRole = user.role === 'station_manager' || user.role === 'admin';
    const isActive = user.status === 'ACTIVE';
    
    return matchesSearch && isEligibleRole && isActive;
  });


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load users when component mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleUserSelect = (user: UserType) => {
    onUserSelect(user);
    setIsOpen(false);
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleClear = () => {
    onUserSelect(null);
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      setIsFocused(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
    setIsFocused(true);
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'station_manager':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'station_manager':
        return 'Station Manager';
      case 'super_admin':
        return 'Super Admin';
      default:
        return role;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        {selectedUser ? (
          <div className="flex items-center justify-between w-full p-3 border border-border rounded-md bg-background">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-medium truncate">
                  {selectedUser.username}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                  {selectedUser.email}
                </div>
              </div>
              <Badge className={getUserRoleColor(selectedUser.role)} variant="outline">
                {getUserRoleLabel(selectedUser.role)}
              </Badge>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleClear}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleInputClick}
                disabled={disabled}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onClick={handleInputClick}
              disabled={disabled}
              className={`pl-10 pr-10 text-sm sm:text-base font-normal ${isFocused ? 'ring-2 ring-ring' : ''}`}
            />
            <ChevronDown 
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden shadow-lg border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground font-normal">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-normal">
                  {searchQuery ? 'No users found matching your search' : 'No eligible users available'}
                </p>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  Only active Station Managers and Admins can be assigned
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="w-full p-3 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none border-b border-border last:border-b-0"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm sm:text-base font-medium truncate">
                            {user.fullName}
                          </span>
                          <Badge className={getUserRoleColor(user.role)} variant="outline">
                            {getUserRoleLabel(user.role)}
                          </Badge>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {user.phone} • @{user.username}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}