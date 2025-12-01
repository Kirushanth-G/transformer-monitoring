# Maintenance Records API Documentation

## Overview
This API provides endpoints for managing manual field inspection reports, electrical readings, and inspection schematics for transformer maintenance operations.

## Base URL
```
http://localhost:8080/api/maintenance-records
```

## CORS Configuration
The API supports CORS for the following origins:
- `http://localhost:5173`
- `http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com`

---

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/maintenance-records` | Create new maintenance record |
| GET | `/api/maintenance-records/{id}` | Get record by ID |
| GET | `/api/maintenance-records/inspection/{inspectionId}` | Get record by inspection ID |
| GET | `/api/maintenance-records` | List all records (paginated) |
| GET | `/api/maintenance-records/status` | List records by status (paginated) |
| PUT | `/api/maintenance-records/{id}` | Update maintenance record |
| POST | `/api/maintenance-records/{id}/finalize` | Finalize record (lock editing) |
| DELETE | `/api/maintenance-records/{id}` | Delete maintenance record |
| POST | `/api/maintenance-records/{id}/electrical-readings` | Add electrical readings |
| GET | `/api/maintenance-records/{id}/electrical-readings` | Get electrical readings |
| PUT | `/api/maintenance-records/electrical-readings/{readingId}` | Update electrical reading |
| POST | `/api/maintenance-records/inspections/{inspectionId}/schematic` | Save inspection schematic |
| GET | `/api/maintenance-records/inspections/{inspectionId}/schematic` | Get inspection schematic |
| DELETE | `/api/maintenance-records/inspections/{inspectionId}/schematic` | Delete inspection schematic |

---

## 1. Maintenance Record Operations

### 1.1 Create Maintenance Record
**POST** `/api/maintenance-records`

Creates a new maintenance record for an inspection.

**Request Body:**
```json
{
  "inspectionId": 1,
  "inspectorName": "John Doe",
  "supervisedBy": "Jane Smith",
  "jobStartedAt": "2025-11-30T09:00:00",
  "jobCompletedAt": "2025-11-30T09:16:00",
  "baselineIrNo": "02062",
  "baselineCondition": "Sunny",
  "findingsSummary": "All components operational",
  "recommendations": "Schedule follow-up in 6 months",
  "electricalReadings": [
    {
      "readingStage": "FIRST_INSPECTION",
      "voltsR": 237.0,
      "voltsY": 238.0,
      "voltsB": 236.0,
      "ampsR": 87.0,
      "ampsY": 105.0,
      "ampsB": 67.0,
      "ampsNeutral": 40.0
    },
    {
      "readingStage": "SECOND_INSPECTION",
      "voltsR": 237.0,
      "voltsY": 237.0,
      "voltsB": 238.0,
      "ampsR": 85.0,
      "ampsY": 103.0,
      "ampsB": 65.0,
      "ampsNeutral": 38.0
    }
  ]
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| inspectionId | Long | Yes | ID of the existing inspection |
| inspectorName | String | No | Name of the inspector |
| supervisedBy | String | No | Name of the supervisor |
| jobStartedAt | DateTime | No | Job start timestamp (ISO-8601) |
| jobCompletedAt | DateTime | No | Job completion timestamp (ISO-8601) |
| baselineIrNo | String | No | Baseline IR number (e.g., "02062") |
| baselineCondition | String | No | Weather condition (Sunny/Cloudy/Rainy) |
| findingsSummary | String | No | Summary of findings |
| recommendations | String | No | Recommendations for follow-up |
| electricalReadings | Array | No | Optional array of electrical readings |

**Response:** `201 CREATED`
```json
{
  "id": 1,
  "inspectionId": 1,
  "inspectionNo": "INSP-001",
  "inspectorName": "John Doe",
  "supervisedBy": "Jane Smith",
  "jobStartedAt": "2025-11-30T09:00:00",
  "jobCompletedAt": "2025-11-30T09:16:00",
  "baselineIrNo": "02062",
  "baselineCondition": "Sunny",
  "findingsSummary": "All components operational",
  "recommendations": "Schedule follow-up in 6 months",
  "isFinalized": false,
  "createdAt": "2025-11-30T10:00:00",
  "updatedAt": "2025-11-30T10:00:00",
  "electricalReadings": [
    {
      "id": 1,
      "readingStage": "FIRST_INSPECTION",
      "voltsR": 237.0,
      "voltsY": 238.0,
      "voltsB": 236.0,
      "ampsR": 87.0,
      "ampsY": 105.0,
      "ampsB": 67.0,
      "ampsNeutral": 40.0,
      "createdAt": "2025-11-30T10:00:00"
    }
  ]
}
```

**Error Responses:**
- `400 BAD REQUEST` - Invalid request data or inspection already has a maintenance record
- `404 NOT FOUND` - Inspection not found

---

### 1.2 Get Maintenance Record by ID
**GET** `/api/maintenance-records/{id}`

Retrieves a maintenance record by its ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Maintenance record ID |

**Response:** `200 OK`
```json
{
  "id": 1,
  "inspectionId": 1,
  "inspectionNo": "INSP-001",
  "inspectorName": "John Doe",
  "supervisedBy": "Jane Smith",
  "jobStartedAt": "2025-11-30T09:00:00",
  "jobCompletedAt": "2025-11-30T09:16:00",
  "baselineIrNo": "02062",
  "baselineCondition": "Sunny",
  "findingsSummary": "All components operational",
  "recommendations": "Schedule follow-up in 6 months",
  "isFinalized": false,
  "createdAt": "2025-11-30T10:00:00",
  "updatedAt": "2025-11-30T10:00:00",
  "electricalReadings": [...]
}
```

**Error Responses:**
- `404 NOT FOUND` - Maintenance record not found

---

### 1.3 Get Maintenance Record by Inspection ID
**GET** `/api/maintenance-records/inspection/{inspectionId}`

Retrieves the maintenance record associated with a specific inspection.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inspectionId | Long | Yes | Inspection ID |

**Response:** `200 OK` - Same structure as 1.2

**Error Responses:**
- `404 NOT FOUND` - No maintenance record found for the inspection

---

### 1.4 Get All Maintenance Records (Paginated)
**GET** `/api/maintenance-records`

Retrieves all maintenance records with pagination support.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Integer | No | 0 | Page number (0-based) |
| size | Integer | No | 10 | Number of records per page |

**Example Request:**
```
GET /api/maintenance-records?page=0&size=10
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "inspectionId": 1,
      "inspectionNo": "INSP-001",
      "inspectorName": "John Doe",
      "supervisedBy": "Jane Smith",
      "jobStartedAt": "2025-11-30T09:00:00",
      "jobCompletedAt": "2025-11-30T09:16:00",
      "isFinalized": false,
      "createdAt": "2025-11-30T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalPages": 5,
  "totalElements": 50,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

---

### 1.5 Get Maintenance Records by Status
**GET** `/api/maintenance-records/status`

Retrieves maintenance records filtered by finalization status with pagination.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| finalized | Boolean | Yes | - | Filter by finalization status (true/false) |
| page | Integer | No | 0 | Page number (0-based) |
| size | Integer | No | 10 | Number of records per page |

**Example Requests:**
```
GET /api/maintenance-records/status?finalized=false&page=0&size=10
GET /api/maintenance-records/status?finalized=true&page=0&size=20
```

**Response:** `200 OK` - Same structure as 1.4

---

### 1.6 Update Maintenance Record
**PUT** `/api/maintenance-records/{id}`

Updates an existing maintenance record. Only allowed if the record is not finalized.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Maintenance record ID |

**Request Body:** Same structure as 1.1 (Create)

**Response:** `200 OK` - Updated maintenance record

**Error Responses:**
- `400 BAD REQUEST` - Record is finalized or invalid data
- `404 NOT FOUND` - Maintenance record not found

---

### 1.7 Finalize Maintenance Record
**POST** `/api/maintenance-records/{id}/finalize`

Finalizes a maintenance record, making it read-only. Once finalized, the record cannot be edited or deleted.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Maintenance record ID |

**Response:** `200 OK`
```json
{
  "id": 1,
  "inspectionId": 1,
  "inspectionNo": "INSP-001",
  "isFinalized": true,
  "createdAt": "2025-11-30T10:00:00",
  "updatedAt": "2025-11-30T11:00:00"
}
```

**Error Responses:**
- `400 BAD REQUEST` - Record is already finalized
- `404 NOT FOUND` - Maintenance record not found

---

### 1.8 Delete Maintenance Record
**DELETE** `/api/maintenance-records/{id}`

Deletes a maintenance record. Only allowed if the record is not finalized.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Maintenance record ID |

**Response:** `204 NO CONTENT`

**Error Responses:**
- `400 BAD REQUEST` - Record is finalized and cannot be deleted
- `404 NOT FOUND` - Maintenance record not found

---

## 2. Electrical Readings Operations

### 2.1 Add Electrical Readings
**POST** `/api/maintenance-records/{id}/electrical-readings`

Adds electrical readings to an existing maintenance record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Maintenance record ID |

**Request Body:**
```json
[
  {
    "readingStage": "FIRST_INSPECTION",
    "voltsR": 237.0,
    "voltsY": 238.0,
    "voltsB": 236.0,
    "ampsR": 87.0,
    "ampsY": 105.0,
    "ampsB": 67.0,
    "ampsNeutral": 40.0
  },
  {
    "readingStage": "SECOND_INSPECTION",
    "voltsR": 237.0,
    "voltsY": 237.0,
    "voltsB": 238.0,
    "ampsR": 85.0,
    "ampsY": 103.0,
    "ampsB": 65.0,
    "ampsNeutral": 38.0
  }
]
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| readingStage | String | Yes | FIRST_INSPECTION or SECOND_INSPECTION |
| voltsR | BigDecimal | No | Voltage reading for R phase |
| voltsY | BigDecimal | No | Voltage reading for Y phase |
| voltsB | BigDecimal | No | Voltage reading for B phase |
| ampsR | BigDecimal | No | Current reading for R phase |
| ampsY | BigDecimal | No | Current reading for Y phase |
| ampsB | BigDecimal | No | Current reading for B phase |
| ampsNeutral | BigDecimal | No | Neutral current reading |

**Response:** `201 CREATED`
```json
[
  {
    "id": 1,
    "readingStage": "FIRST_INSPECTION",
    "voltsR": 237.0,
    "voltsY": 238.0,
    "voltsB": 236.0,
    "ampsR": 87.0,
    "ampsY": 105.0,
    "ampsB": 67.0,
    "ampsNeutral": 40.0,
    "createdAt": "2025-11-30T10:00:00"
  },
  {
    "id": 2,
    "readingStage": "SECOND_INSPECTION",
    "voltsR": 237.0,
    "voltsY": 237.0,
    "voltsB": 238.0,
    "ampsR": 85.0,
    "ampsY": 103.0,
    "ampsB": 65.0,
    "ampsNeutral": 38.0,
    "createdAt": "2025-11-30T10:05:00"
  }
]
```

**Error Responses:**
- `400 BAD REQUEST` - Record is finalized or reading stage already exists
- `404 NOT FOUND` - Maintenance record not found

---

### 2.2 Get Electrical Readings
**GET** `/api/maintenance-records/{id}/electrical-readings`

Retrieves all electrical readings for a maintenance record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | Maintenance record ID |

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "readingStage": "FIRST_INSPECTION",
    "voltsR": 237.0,
    "voltsY": 238.0,
    "voltsB": 236.0,
    "ampsR": 87.0,
    "ampsY": 105.0,
    "ampsB": 67.0,
    "ampsNeutral": 40.0,
    "createdAt": "2025-11-30T10:00:00"
  },
  {
    "id": 2,
    "readingStage": "SECOND_INSPECTION",
    "voltsR": 237.0,
    "voltsY": 237.0,
    "voltsB": 238.0,
    "ampsR": 85.0,
    "ampsY": 103.0,
    "ampsB": 65.0,
    "ampsNeutral": 38.0,
    "createdAt": "2025-11-30T10:05:00"
  }
]
```

**Error Responses:**
- `404 NOT FOUND` - Maintenance record not found

---

### 2.3 Update Electrical Reading
**PUT** `/api/maintenance-records/electrical-readings/{readingId}`

Updates a specific electrical reading.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| readingId | Long | Yes | Electrical reading ID |

**Request Body:**
```json
{
  "readingStage": "FIRST_INSPECTION",
  "voltsR": 238.0,
  "voltsY": 239.0,
  "voltsB": 237.0,
  "ampsR": 88.0,
  "ampsY": 106.0,
  "ampsB": 68.0,
  "ampsNeutral": 41.0
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "readingStage": "FIRST_INSPECTION",
  "voltsR": 238.0,
  "voltsY": 239.0,
  "voltsB": 237.0,
  "ampsR": 88.0,
  "ampsY": 106.0,
  "ampsB": 68.0,
  "ampsNeutral": 41.0,
  "createdAt": "2025-11-30T10:00:00"
}
```

**Error Responses:**
- `400 BAD REQUEST` - Maintenance record is finalized
- `404 NOT FOUND` - Electrical reading not found

---

## 3. Inspection Schematic Operations

### 3.1 Save Inspection Schematic
**POST** `/api/maintenance-records/inspections/{inspectionId}/schematic`

Saves or updates the diagram state for an inspection (tick boxes for LA, DDLO, FDS components).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inspectionId | Long | Yes | Inspection ID |

**Request Body:**
```json
{
  "diagramState": "{\"lightning_arresters\":{\"status\":\"OK\",\"is_checked\":true},\"ddlo_fuses\":{\"status\":\"OK\",\"is_checked\":true},\"fds_boxes\":[{\"id\":1,\"label\":\"FDS1\",\"status_text\":\"Ok\",\"is_checked\":true},{\"id\":2,\"label\":\"FDS2\",\"status_text\":\"Ok\",\"is_checked\":true},{\"id\":3,\"label\":\"FDS3\",\"status_text\":\"Ok\",\"is_checked\":true},{\"id\":4,\"label\":\"FDS4\",\"status_text\":\"Ok\",\"is_checked\":true}]}"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| diagramState | String (JSONB) | Yes | JSON string representing diagram component states |

**Diagram State Structure:**
```json
{
  "lightning_arresters": {
    "status": "OK",
    "is_checked": true
  },
  "ddlo_fuses": {
    "status": "OK",
    "is_checked": true
  },
  "fds_boxes": [
    {
      "id": 1,
      "label": "FDS1",
      "status_text": "Ok",
      "is_checked": true
    },
    {
      "id": 2,
      "label": "FDS2",
      "status_text": "Ok",
      "is_checked": true
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "inspectionId": 1,
  "diagramState": "{\"lightning_arresters\":{\"status\":\"OK\",\"is_checked\":true},...}",
  "updatedAt": "2025-11-30T10:00:00"
}
```

**Error Responses:**
- `400 BAD REQUEST` - Invalid diagram state JSON
- `404 NOT FOUND` - Inspection not found

---

### 3.2 Get Inspection Schematic
**GET** `/api/maintenance-records/inspections/{inspectionId}/schematic`

Retrieves the diagram state for an inspection.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inspectionId | Long | Yes | Inspection ID |

**Response:** `200 OK`
```json
{
  "id": 1,
  "inspectionId": 1,
  "diagramState": "{\"lightning_arresters\":{\"status\":\"OK\",\"is_checked\":true},...}",
  "updatedAt": "2025-11-30T10:00:00"
}
```

**Error Responses:**
- `404 NOT FOUND` - Schematic not found for inspection

---

### 3.3 Delete Inspection Schematic
**DELETE** `/api/maintenance-records/inspections/{inspectionId}/schematic`

Deletes the diagram state for an inspection.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inspectionId | Long | Yes | Inspection ID |

**Response:** `204 NO CONTENT`

**Error Responses:**
- `400 BAD REQUEST` - Unable to delete schematic
- `404 NOT FOUND` - Schematic not found

---

## Data Models

### Reading Stages
- `FIRST_INSPECTION` - Initial electrical readings
- `SECOND_INSPECTION` - Follow-up electrical readings

### Baseline Conditions
- `Sunny` - Clear weather
- `Cloudy` - Overcast conditions
- `Rainy` - Wet weather conditions

### Date/Time Format
All timestamps follow **ISO-8601** format: `YYYY-MM-DDTHH:mm:ss`

Example: `2025-11-30T09:00:00`

---

## Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | CREATED - Resource created successfully |
| 204 | NO CONTENT - Successful deletion |
| 400 | BAD REQUEST - Invalid request data or business rule violation |
| 404 | NOT FOUND - Resource not found |
| 500 | INTERNAL SERVER ERROR - Server error |

---

## Usage Examples with cURL

### Example 1: Create Complete Maintenance Record

```bash
curl -X POST http://localhost:8080/api/maintenance-records \
  -H "Content-Type: application/json" \
  -d '{
    "inspectionId": 1,
    "inspectorName": "John Doe",
    "supervisedBy": "Jane Smith",
    "jobStartedAt": "2025-11-30T09:00:00",
    "jobCompletedAt": "2025-11-30T09:16:00",
    "baselineIrNo": "02062",
    "baselineCondition": "Sunny",
    "findingsSummary": "All components operational. No anomalies detected.",
    "recommendations": "Schedule follow-up in 6 months",
    "electricalReadings": [
      {
        "readingStage": "FIRST_INSPECTION",
        "voltsR": 237.0,
        "voltsY": 238.0,
        "voltsB": 236.0,
        "ampsR": 87.0,
        "ampsY": 105.0,
        "ampsB": 67.0,
        "ampsNeutral": 40.0
      }
    ]
  }'
```

### Example 2: Get All Draft Records

```bash
curl -X GET "http://localhost:8080/api/maintenance-records/status?finalized=false&page=0&size=20"
```

### Example 3: Add Electrical Readings

```bash
curl -X POST http://localhost:8080/api/maintenance-records/1/electrical-readings \
  -H "Content-Type: application/json" \
  -d '[
    {
      "readingStage": "SECOND_INSPECTION",
      "voltsR": 237.0,
      "voltsY": 237.0,
      "voltsB": 238.0,
      "ampsR": 85.0,
      "ampsY": 103.0,
      "ampsB": 65.0,
      "ampsNeutral": 38.0
    }
  ]'
```

### Example 4: Save Schematic Diagram

```bash
curl -X POST http://localhost:8080/api/maintenance-records/inspections/1/schematic \
  -H "Content-Type: application/json" \
  -d '{
    "diagramState": "{\"lightning_arresters\":{\"status\":\"OK\",\"is_checked\":true},\"ddlo_fuses\":{\"status\":\"OK\",\"is_checked\":true},\"fds_boxes\":[{\"id\":1,\"label\":\"FDS1\",\"status_text\":\"Ok\",\"is_checked\":true},{\"id\":2,\"label\":\"FDS2\",\"status_text\":\"Ok\",\"is_checked\":true}]}"
  }'
```

### Example 5: Finalize Record

```bash
curl -X POST http://localhost:8080/api/maintenance-records/1/finalize
```

### Example 6: Get Record with All Details

```bash
curl -X GET http://localhost:8080/api/maintenance-records/1
```

---

## Business Rules

1. **Uniqueness**: Each inspection can have only ONE maintenance record
2. **Finalization**: Once finalized, records become read-only and cannot be edited or deleted
3. **Reading Stages**: Each maintenance record can have maximum TWO electrical readings (FIRST_INSPECTION and SECOND_INSPECTION)
4. **Duplicate Prevention**: Cannot add multiple readings with the same reading stage
5. **Cascade Delete**: Deleting a maintenance record will also delete its electrical readings
6. **One-to-One Schematic**: Each inspection can have only one schematic diagram

---

## Integration Notes

- All endpoints support **JSON** request/response format
- **CORS** is enabled for frontend integration
- **Pagination** is available for list endpoints with default page size of 10
- **JSONB** is used for flexible diagram state storage in PostgreSQL
- Works seamlessly with existing **Inspection** and **Transformer** entities

---

## Error Handling

All error responses now follow this standardized structure:

```json
{
  "message": "Descriptive error message explaining what went wrong",
  "error": "Bad Request",
  "status": 400,
  "timestamp": "2025-11-30T10:00:00"
}
```

**Error Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| message | String | Human-readable description of the error |
| error | String | HTTP error type (e.g., "Bad Request", "Not Found") |
| status | Integer | HTTP status code (400, 404, 500) |
| timestamp | DateTime | When the error occurred (ISO-8601) |

**Common Error Scenarios:**

### Finalize Endpoint Errors:
- **`404 NOT FOUND`**
  ```json
  {
    "message": "Maintenance record not found with id: 123",
    "error": "Not Found",
    "status": 404,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

- **`400 BAD REQUEST`** - Already Finalized
  ```json
  {
    "message": "Maintenance record is already finalized",
    "error": "Bad Request",
    "status": 400,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

### Create/Update Endpoint Errors:
- **`400 BAD REQUEST`** - Duplicate Record
  ```json
  {
    "message": "Maintenance record already exists for inspection: 1",
    "error": "Bad Request",
    "status": 400,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

- **`400 BAD REQUEST`** - Finalized Record
  ```json
  {
    "message": "Cannot update finalized maintenance record",
    "error": "Bad Request",
    "status": 400,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

- **`404 NOT FOUND`** - Invalid Inspection
  ```json
  {
    "message": "Inspection not found with id: 999",
    "error": "Not Found",
    "status": 404,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

### Electrical Readings Errors:
- **`400 BAD REQUEST`** - Duplicate Reading Stage
  ```json
  {
    "message": "Reading already exists for stage: FIRST_INSPECTION",
    "error": "Bad Request",
    "status": 400,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

- **`400 BAD REQUEST`** - Finalized Record
  ```json
  {
    "message": "Cannot add readings to finalized maintenance record",
    "error": "Bad Request",
    "status": 400,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

### Schematic Errors:
- **`404 NOT FOUND`** - Invalid Inspection
  ```json
  {
    "message": "Inspection not found with id: 999",
    "error": "Not Found",
    "status": 404,
    "timestamp": "2025-11-30T10:00:00"
  }
  ```

**Note:** The frontend can now extract the `message` field from error responses to display meaningful feedback to users instead of generic error messages.

---

## Notes

- All timestamps are in **ISO-8601 format**
- Finalized records are **immutable**
- Electrical readings support **decimal precision** for accurate measurements
- Diagram states stored as **JSONB** allow flexible component structures
- **Soft validation**: Most fields are optional to support partial data entry during field work
- **Improved error messages**: All endpoints now return descriptive error messages for better debugging and user feedback

---

