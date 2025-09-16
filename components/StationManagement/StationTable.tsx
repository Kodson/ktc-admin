import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Building2, 
  MapPin, 
  User, 
  Eye, 
  Edit3, 
  Trash2,
  Power, 
  PowerOff, 
  CheckCircle2,
  UserPlus,
  UserMinus,
  AlertTriangle 
} from 'lucide-react';
import { 
  STATION_STATUS, 
  USER_STATUS, 
  STATUS_COLORS, 
  USER_STATUS_COLORS, 
  formatCurrency 
} from '../../constants/stationManagementConstants';
import type { Station } from '../../types/stationManagement';

interface StationTableProps {
  stations: Station[];
  isSubmitting: boolean;
  userRole: string;
  onViewDetails: (station: Station) => void;
  onEditStation?: (station: Station) => void;
  onDeleteStation?: (station: Station) => void;
  onStatusChange: (stationId: string, status: Station['operational']['status']) => void;
  onAssignManager?: (station: Station) => void;
  onUnassignManager?: (station: Station) => void;
}

export function StationTable({ 
  stations, 
  isSubmitting,
  userRole,
  onViewDetails, 
  onEditStation,
  onDeleteStation,
  onStatusChange,
  onAssignManager,
  onUnassignManager 
}: StationTableProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get user status color
  const getUserStatusColor = (status: string) => {
    return USER_STATUS_COLORS[status as keyof typeof USER_STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table className="min-w-[1400px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-sm sm:text-base font-medium">Station Details</TableHead>
            <TableHead className="text-sm sm:text-base font-medium">Location</TableHead>
            <TableHead className="text-sm sm:text-base font-medium">User Account</TableHead>
            <TableHead className="text-center text-sm sm:text-base font-medium">Station Status</TableHead>
            <TableHead className="text-center text-sm sm:text-base font-medium">Manager</TableHead>
            <TableHead className="text-right text-sm sm:text-base font-medium">Monthly Target</TableHead>
            <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations.map((station) => (
            <TableRow key={station.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm sm:text-base font-medium flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    {station.name}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm font-normal">
                    {station.code}
                  </div>
                  <div className="text-muted-foreground text-xs font-normal">
                    {station.operational.pumpCount} pumps • {station.operational.fuelTypes.length} fuel types
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm sm:text-base font-medium flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {station.location.city}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm font-normal">
                    {station.location.region}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {station.user ? (
                    <>
                      <div className="text-sm font-medium flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {station.user.username}
                      </div>
                      <div className="text-muted-foreground text-xs font-normal">
                        {station.user.email}
                      </div>
                      {station.user.lastLogin && (
                        <div className="text-muted-foreground text-xs font-normal">
                          Last: {new Date(station.user.lastLogin).toLocaleDateString('en-GH')}
                        </div>
                      )}
                      <Badge className={getUserStatusColor(station.user.status)} variant="outline">
                        {USER_STATUS[station.user.status as keyof typeof USER_STATUS]}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium flex items-center text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No User Account
                      </div>
                      <div className="text-muted-foreground text-xs font-normal">
                        User account not created
                      </div>
                      <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                        Missing User
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Badge className={getStatusColor(station.operational.status)} variant="outline">
                    {STATION_STATUS[station.operational.status]}
                  </Badge>
                  {station.operational.status === 'ACTIVE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onStatusChange(station.id, 'INACTIVE')}
                      disabled={isSubmitting}
                    >
                      <PowerOff className="h-3 w-3 text-red-600" />
                    </Button>
                  )}
                  {station.operational.status === 'INACTIVE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onStatusChange(station.id, 'ACTIVE')}
                      disabled={isSubmitting}
                    >
                      <Power className="h-3 w-3 text-green-600" />
                    </Button>
                  )}
                  {station.operational.status === 'MAINTENANCE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onStatusChange(station.id, 'ACTIVE')}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="space-y-1">
                  {station.contact.manager ? (
                    <>
                      <div className="text-sm font-medium flex items-center justify-center">
                        <User className="h-3 w-3 mr-1" />
                        {station.contact.manager.name}
                      </div>
                      <div className="text-muted-foreground text-xs font-normal">
                        {station.contact.manager.phone}
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                        Assigned
                      </Badge>
                      {onUnassignManager && (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && (
                        <div className="mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2 text-red-600 hover:text-red-700"
                            onClick={() => onUnassignManager(station)}
                            disabled={isSubmitting}
                          >
                            <UserMinus className="h-3 w-3 mr-1" />
                            Unassign
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground font-normal">
                        No Manager
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200" variant="outline">
                        Unassigned
                      </Badge>
                      {onAssignManager && (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && (
                        <div className="mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => onAssignManager(station)}
                            disabled={isSubmitting}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm sm:text-base font-medium">
                  {formatCurrency(station.financial.monthlyTarget)}
                </div>
                <div className="text-muted-foreground text-xs font-normal">
                  Monthly target
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onViewDetails(station)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {/* Admin/Super Admin Actions */}
                  {(userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && (
                    <>
                      {onEditStation && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => onEditStation(station)}
                          disabled={isSubmitting}
                        >
                          <Edit3 className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {onDeleteStation && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => onDeleteStation(station)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}