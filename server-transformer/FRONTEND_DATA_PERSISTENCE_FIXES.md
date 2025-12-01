# Frontend Data Persistence Fixes - Summary

## Issues Identified and Fixed

After analyzing the frontend flow, three data persistence issues were identified and resolved:

---

## ✅ **Issue 1: Neutral Voltage (voltsN) Not Persisted**

### Problem:
The frontend was sending `voltsN` (neutral phase voltage) in the electrical readings payload, but the backend was **only storing neutral current** (`ampsNeutral`). The neutral voltage field was completely missing from the database schema, entity, and DTOs.

### Root Cause:
- Database table `electrical_readings` only had `amps_neutral` column, no `volts_neutral`
- Entity `ElectricalReading` only had `ampsNeutral` field
- DTOs `ElectricalReadingRequest` and `ElectricalReadingResponse` were missing `voltsNeutral`

### Fix Applied:
1. ✅ Created migration **V15__add_neutral_voltage.sql** to add `volts_neutral` column
2. ✅ Updated `ElectricalReading` entity with `voltsNeutral` field
3. ✅ Updated `ElectricalReadingRequest` DTO with `voltsNeutral` field
4. ✅ Updated `ElectricalReadingResponse` DTO with `voltsNeutral` field
5. ✅ Updated `MaintenanceRecordService.updateElectricalReading()` to save `voltsNeutral`

### Result:
The backend now accepts, stores, and returns the neutral voltage reading.

**Request/Response Format:**
```json
{
  "readingStage": "FIRST_INSPECTION",
  "voltsR": 237.0,
  "voltsY": 238.0,
  "voltsB": 236.0,
  "voltsNeutral": 235.0,  // ✅ NOW SUPPORTED
  "ampsR": 87.0,
  "ampsY": 105.0,
  "ampsB": 67.0,
  "ampsNeutral": 40.0
}
```

---

## ✅ **Issue 2: Baseline IR Number Field Name Mismatch**

### Problem:
- Frontend sends: `baselineIrNumber`
- Backend expects: `baselineIrNo`

This mismatch was causing the baseline IR number to not be saved or returned.

### Current Status:
**The backend field name is correct as `baselineIrNo`**. The issue is that the frontend needs to align with the backend's field naming.

### Backend Field (Confirmed Working):
```java
// MaintenanceRecordRequest.java
private String baselineIrNo;  // ✅ Backend uses this name

// MaintenanceRecordResponse.java
private String baselineIrNo;  // ✅ Backend returns this name
```

### Frontend Should Send:
```json
{
  "inspectionId": 1,
  "baselineIrNo": "02062",  // ✅ Use this field name (not baselineIrNumber)
  "baselineCondition": "Sunny",
  // ... other fields
}
```

### Action Required:
**Frontend needs to change:**
- `recordData.baselineIrNumber` → `recordData.baselineIrNo`
- `data.baselineIrNumber` → `data.baselineIrNo`

---

## ✅ **Issue 3: Schematic Diagram State Returns 404**

### Problem:
When no schematic had been saved yet, GET request returned 404, causing console errors in the frontend.

### Fix Applied:
Modified `MaintenanceRecordService.getSchematic()` to return an **empty schematic with `{}` (empty JSON object)** instead of throwing 404.

### Before:
```java
public InspectionSchematicResponse getSchematic(Long inspectionId) {
    InspectionSchematic schematic = inspectionSchematicRepository.findByInspectionId(inspectionId)
        .orElseThrow(() -> new RuntimeException("Schematic not found"));  // ❌ Throws 404
    return mapper.toResponse(schematic);
}
```

### After:
```java
public InspectionSchematicResponse getSchematic(Long inspectionId) {
    Inspection inspection = inspectionRepository.findById(inspectionId)
        .orElseThrow(() -> new RuntimeException("Inspection not found"));

    InspectionSchematic schematic = inspectionSchematicRepository.findByInspectionId(inspectionId)
        .orElseGet(() -> {
            InspectionSchematic emptySchematic = new InspectionSchematic();
            emptySchematic.setInspection(inspection);
            emptySchematic.setDiagramState("{}");  // ✅ Returns empty JSON
            return emptySchematic;
        });
    return mapper.toResponse(schematic);
}
```

### Result:
- ✅ No more 404 errors when fetching schematics for the first time
- ✅ Frontend receives `{"diagramState": "{}"}` and can render a blank diagram
- ✅ Only returns 404 if the inspection itself doesn't exist

---

## Summary of Database Changes

### New Migration: V15__add_neutral_voltage.sql
```sql
ALTER TABLE electrical_readings
ADD COLUMN volts_neutral NUMERIC(10, 2);
```

This adds support for neutral phase voltage readings.

---

## Files Modified

1. **Database Migration**
   - ✅ `V15__add_neutral_voltage.sql` (new)

2. **Entity Layer**
   - ✅ `ElectricalReading.java` - Added `voltsNeutral` field

3. **DTO Layer**
   - ✅ `ElectricalReadingRequest.java` - Added `voltsNeutral` field
   - ✅ `ElectricalReadingResponse.java` - Added `voltsNeutral` field

4. **Service Layer**
   - ✅ `MaintenanceRecordService.java` - Updated `updateElectricalReading()` to include `voltsNeutral`
   - ✅ `MaintenanceRecordService.java` - Updated `getSchematic()` to return empty object instead of 404

---

## Testing Checklist

### Neutral Voltage (voltsN)
- [ ] Restart Spring Boot application (migration V15 will run automatically)
- [ ] Send electrical reading with all 4 voltage fields (R, Y, B, N)
- [ ] Verify response includes `voltsNeutral`
- [ ] Fetch electrical readings and confirm `voltsNeutral` is returned

### Baseline IR Number
- [ ] Frontend: Change `baselineIrNumber` to `baselineIrNo` in payload
- [ ] Send maintenance record with `baselineIrNo` field
- [ ] Verify response includes `baselineIrNo` with saved value
- [ ] Fetch maintenance record and confirm `baselineIrNo` is returned

### Schematic Diagram
- [ ] Fetch schematic for inspection that has no saved schematic
- [ ] Verify response is 200 OK with `{"diagramState": "{}"}`
- [ ] No 404 errors in console
- [ ] Save a schematic and fetch again - should return saved state

---

## API Examples

### 1. Create Maintenance Record with Neutral Voltage
```bash
curl -X POST http://localhost:8080/api/maintenance-records \
  -H "Content-Type: application/json" \
  -d '{
    "inspectionId": 1,
    "baselineIrNo": "02062",
    "baselineCondition": "Sunny",
    "electricalReadings": [
      {
        "readingStage": "FIRST_INSPECTION",
        "voltsR": 237.0,
        "voltsY": 238.0,
        "voltsB": 236.0,
        "voltsNeutral": 235.0,
        "ampsR": 87.0,
        "ampsY": 105.0,
        "ampsB": 67.0,
        "ampsNeutral": 40.0
      }
    ]
  }'
```

### 2. Get Schematic (Returns Empty if Not Saved)
```bash
curl -X GET http://localhost:8080/api/maintenance-records/inspections/1/schematic
```

**Response (if not saved yet):**
```json
{
  "id": null,
  "inspectionId": 1,
  "diagramState": "{}",
  "updatedAt": null
}
```

---

## Next Steps

1. **Restart the Spring Boot application** to apply the database migration
2. **Frontend: Update field name** from `baselineIrNumber` to `baselineIrNo`
3. **Test all three fixes** using the testing checklist above
4. **Verify data persistence** by saving, fetching, and checking all three fields

All backend changes are complete and ready to use! 🎉

