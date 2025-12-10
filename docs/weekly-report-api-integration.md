# Weekly Report API Integration

## Overview

The WeeklyReport component has been updated to fetch real data from the backend API instead of using static mock data.

## API Endpoint

```
GET /reports/station/{stationName}?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}
```

### Example Request
```
GET /reports/station/KTC KPONE?startDate=2025-01-01&endDate=2025-01-31
```

## Features Added

### 1. **Station Selection**
- Dropdown to select different stations
- Default: "KTC KPONE"
- Available stations: KTC KPONE, Accra Central Station, KTC TEMA, KTC KUMASI

### 2. **Dynamic Data Fetching**
- Automatically fetches data when station, start date, or end date changes
- Uses React hooks (useEffect) to manage API calls
- Transforms API response to match component's expected data structure

### 3. **Loading States**
- Shows loading spinner when fetching data
- Disables refresh button during loading
- Animated loading indicators

### 4. **Error Handling**
- Error card displays if API call fails
- "Try Again" button to retry failed requests
- Graceful fallback to sample data if API is unavailable

### 5. **Data Source Indicators**
- "Live Data" badge when using API data
- "Sample Data" badge when using fallback data
- Last updated timestamp

### 6. **Manual Refresh**
- Refresh button to manually reload data
- Spinning animation during refresh

## Code Structure

### Service Layer (`services/weeklyReportService.ts`)
- `fetchWeeklyReport()` - Makes API calls
- `transformWeeklyReportData()` - Transforms API response to component format
- `fetchStationsList()` - Gets available stations (future feature)

### Component Updates (`components/WeeklyReport.tsx`)
- Added state management for API data, loading, and errors
- Station selector in the header
- Conditional rendering based on data availability
- Enhanced user feedback with loading and error states

## API Response Format

The API returns data in this structure:

```typescript
{
  summary: {
    salesProfit: number;
    salesValue: number;
    closingStockValue: number;
    // ... other summary fields
  },
  totals: {
    pms: { /* PMS fuel data */ },
    ago: { /* AGO fuel data */ },
    pms_rate: { /* PMS rate data */ },
    ago_rate: { /* AGO rate data */ },
    pms_value: { /* PMS value data */ },
    ago_value: { /* AGO value data */ },
    total: { /* Total calculations */ },
    totalValues: { /* Total values */ }
  }
}
```

## Environment Configuration

Set the API base URL in your environment:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

## Error Scenarios Handled

1. **Network Errors** - Connection issues, timeout
2. **HTTP Errors** - 404, 500, etc.
3. **Invalid Data** - Malformed JSON response
4. **Missing Data** - Empty or null responses

## Fallback Behavior

If the API is unavailable:
- Component shows sample/mock data
- "Sample Data" badge is displayed
- All functionality remains available
- User can still export, print, and share reports

## Testing the Integration

1. **With API Available**:
   - Select different stations
   - Change date ranges
   - Observe "Live Data" badge
   - Check last updated timestamp

2. **With API Unavailable**:
   - Disable network/API server
   - Observe error handling
   - Verify fallback to sample data
   - Test "Try Again" functionality

## Future Enhancements

- [ ] Caching mechanism for frequently accessed data
- [ ] Offline support with local storage
- [ ] Real-time data updates via WebSocket
- [ ] Advanced filtering options
- [ ] Bulk data export for multiple stations