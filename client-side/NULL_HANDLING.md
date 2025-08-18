# Null Value Handling

This implementation handles null values from the backend by displaying "Null" in the frontend.

## Features

### 1. Display Utility Functions
- `displayValue(value, fallback)` - Returns "Null" for null/undefined/empty values
- `displayValueWithStyle(value, fallback)` - Returns styled "Null" text in gray italic

### 2. Component Updates
- **TransformerView**: All data fields handle null values
- **InspectionView**: All data fields handle null values
- **Filtering**: Null values are properly handled in search and filter operations

### 3. Test Data Added
Added test data with null values to demonstrate functionality:

#### Transformers with null values:
- ID: `210999X` - location, poleNo, type are null
- ID: `null` - transformer ID itself is null

#### Inspections with null values:
- Inspection with all null fields
- Inspection with mixed null and valid data

### 4. Visual Styling
Null values are displayed as:
- Text: "Null"
- Style: Gray color, italic font
- Consistent across all components

### 5. Filter Integration
- Null values appear as "Null" in dropdown filters
- Can be filtered and searched properly
- Status badges handle null status values with appropriate gray styling

## Usage Example

```javascript
// In any component
import { displayValue, displayValueWithStyle } from '../utils/displayHelpers';

// Simple text display
<td>{displayValue(data.field)}</td>

// Styled display (React component)
<td>{displayValueWithStyle(data.field)}</td>

// Custom fallback text
<td>{displayValue(data.field, "No Data")}</td>
```

## Backend Integration
When your backend returns null values, they will automatically be handled and displayed as "Null" in the frontend without breaking the UI.
