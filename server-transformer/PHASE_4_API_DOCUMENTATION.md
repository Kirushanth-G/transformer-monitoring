# Phase 4: Human-in-the-Loop API Documentation

## ✅ Implementation Complete

All endpoints for human editing of anomaly detections have been successfully implemented.

---

## 🎯 New API Endpoints

### **1. Add Human-Detected Anomaly**
**Endpoint:** `POST /api/anomalies`

**Use Case:** User manually draws a bounding box for an anomaly the AI missed.

**Request Body:**
```json
{
  "analysisId": 123,
  "x": 100,
  "y": 50,
  "width": 80,
  "height": 60,
  "label": "Hotspot",
  "confidence": 1.0,
  "isCritical": true,
  "severityLevel": "HIGH",
  "userComments": "AI missed this obvious hotspot in the corner",
  "modifiedBy": "user@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": 456,
  "x": 100,
  "y": 50,
  "width": 80,
  "height": 60,
  "label": "Hotspot",
  "detectionSource": "HUMAN",
  "annotationStatus": "ADDED",
  "originalAiPrediction": null,
  "userComments": "AI missed this obvious hotspot in the corner",
  "modifiedBy": "user@example.com",
  "modifiedAt": "2025-11-27T10:30:00"
}
```

---

### **2. Edit Anomaly Detection**
**Endpoint:** `PUT /api/anomalies/{id}`

**Use Case:** User modifies AI's bounding box (resize/move/relabel).

**FR3.3 Critical Feature:** Automatically snapshots AI's original prediction before overwriting.

**Request Body:**
```json
{
  "analysisId": 123,
  "x": 105,
  "y": 55,
  "width": 90,
  "height": 70,
  "label": "Critical Hotspot",
  "isCritical": true,
  "severityLevel": "CRITICAL",
  "userComments": "AI box was too small, resized to include full area",
  "modifiedBy": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "id": 789,
  "x": 105,
  "y": 55,
  "width": 90,
  "height": 70,
  "label": "Critical Hotspot",
  "detectionSource": "AI",
  "annotationStatus": "EDITED",
  "originalAiPrediction": "{\"x\":100,\"y\":50,\"width\":80,\"height\":60}",
  "userComments": "AI box was too small, resized to include full area",
  "modifiedBy": "user@example.com",
  "modifiedAt": "2025-11-27T10:35:00"
}
```

**Backend Logic:**
```java
// Step 1: Snapshot AI's original (ONLY if not already saved)
if (detection.getOriginalAiPrediction() == null) {
    snapshot = "{\"x\":100,\"y\":50,\"width\":80,\"height\":60}";
    detection.setOriginalAiPrediction(snapshot);
}

// Step 2: Apply user's changes
detection.setX(105);
detection.setY(55);
// ... etc

// Step 3: Mark as EDITED
detection.setAnnotationStatus(EDITED);
```

---

### **3. Delete Anomaly Detection (Soft Delete)**
**Endpoint:** `DELETE /api/anomalies/{id}?deletedBy=user@example.com`

**Use Case:** User marks AI detection as false positive (e.g., reflection, shadow).

**FR3.3 Critical Feature:** Preserves data for model retraining (does NOT use SQL DELETE).

**Response:** `204 No Content`

**What Happens:**
```sql
-- NOT executed: DELETE FROM anomaly_detections WHERE id = 789;

-- Instead executed:
UPDATE anomaly_detections 
SET annotation_status = 'DELETED',
    modified_by = 'user@example.com',
    modified_at = NOW()
WHERE id = 789;
```

**Frontend Behavior:**
- Next fetch will exclude this detection (filtered out)
- Data remains in database for AI model retraining

---

### **4. Confirm AI Detection is Correct**
**Endpoint:** `PUT /api/anomalies/{id}/confirm?confirmedBy=user@example.com&comments=AI was spot on`

**Use Case:** User verifies AI's bounding box is accurate.

**Response:** `200 OK`
```json
{
  "id": 789,
  "annotationStatus": "CONFIRMED",
  "userComments": "AI was spot on",
  "modifiedBy": "user@example.com",
  "modifiedAt": "2025-11-27T10:40:00"
}
```

---

### **5. Get Detection by ID**
**Endpoint:** `GET /api/anomalies/{id}`

**Response:** `200 OK`
```json
{
  "id": 789,
  "x": 100,
  "y": 50,
  "width": 80,
  "height": 60,
  "label": "Hotspot",
  "confidence": 0.95,
  "detectionSource": "AI",
  "annotationStatus": "UNVERIFIED",
  "originalAiPrediction": null
}
```

---

### **6. Get Detections for Analysis**
**Endpoint:** `GET /api/anomalies/analysis/{analysisId}?includeDeleted=false`

**Use Case:** Frontend fetches all bounding boxes for an image.

**Query Parameters:**
- `includeDeleted` (default: `false`) - Set to `true` to include deleted detections

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "x": 100,
    "y": 50,
    "annotationStatus": "UNVERIFIED",
    "detectionSource": "AI"
  },
  {
    "id": 2,
    "x": 200,
    "y": 150,
    "annotationStatus": "EDITED",
    "detectionSource": "AI",
    "originalAiPrediction": "{\"x\":195,\"y\":145,\"width\":50,\"height\":50}"
  },
  {
    "id": 3,
    "x": 300,
    "y": 250,
    "annotationStatus": "ADDED",
    "detectionSource": "HUMAN"
  }
]
```

**Note:** Deleted detections (`annotationStatus='DELETED'`) are excluded by default.

---

### **7. Verify Thermal Analysis**
**Endpoint:** `PUT /api/thermal/{id}/verify?reviewedBy=user@example.com`

**Use Case:** User marks entire analysis as reviewed and approved.

**Response:** `200 OK`
```json
{
  "id": 123,
  "reviewStatus": "VERIFIED",
  "reviewedBy": "user@example.com",
  "reviewedAt": "2025-11-27T10:45:00",
  "originalWidth": 1920,
  "originalHeight": 1080,
  "detections": [...]
}
```

---

## 🔄 Complete User Workflow

### **Scenario: Human Reviews AI Analysis**

1. **AI Generates Analysis**
   ```
   POST /api/thermal/analyze
   → Returns analysis with detections (all status=UNVERIFIED)
   ```

2. **Frontend Loads Image + Boxes**
   ```
   GET /api/thermal/{analysisId}
   → Receives originalWidth, originalHeight, detections[]
   → Renders bounding boxes on image
   ```

3. **User Action: Resize AI's Box**
   ```
   PUT /api/anomalies/789
   Body: {x: 105, y: 55, width: 90, height: 70, ...}
   → Backend snapshots AI original: {"x":100,"y":50,"width":80,"height":60}
   → Updates to new coordinates
   → Sets status=EDITED
   ```

4. **User Action: Delete False Positive**
   ```
   DELETE /api/anomalies/456?deletedBy=user@example.com
   → Sets status=DELETED (soft delete)
   → Data preserved for retraining
   ```

5. **User Action: Add Missed Anomaly**
   ```
   POST /api/anomalies
   Body: {x: 500, y: 300, width: 60, height: 50, ...}
   → Creates new detection with status=ADDED, source=HUMAN
   ```

6. **User Completes Review**
   ```
   PUT /api/thermal/123/verify?reviewedBy=user@example.com
   → Sets reviewStatus=VERIFIED
   ```

---

## 📊 Annotation Status State Machine

```
┌─────────────┐
│ UNVERIFIED  │ ← AI detections start here
└──────┬──────┘
       │
       ├──→ CONFIRMED (user says AI correct)
       ├──→ EDITED (user modifies box)
       └──→ DELETED (false positive)

┌─────────────┐
│   ADDED     │ ← Human-added detections start here
└─────────────┘
```

---

## 🎯 FR3.3 Compliance Verification

| Requirement | Endpoint | Implementation |
|-------------|----------|----------------|
| **Original AI Detections** | `PUT /api/anomalies/{id}` | Snapshots to `original_ai_prediction` JSONB |
| **Final Human Annotations** | `PUT /api/anomalies/{id}` | Overwrites main `x,y,width,height` columns |
| **Annotation Type** | All endpoints | `annotation_status` enum tracks ADDED/EDITED/DELETED |
| **User Comments** | All endpoints | `user_comments` TEXT field |
| **Modification Tracking** | All endpoints | `modified_by`, `modified_at` timestamps |
| **Soft Delete** | `DELETE /api/anomalies/{id}` | Sets `status=DELETED`, preserves row |

---

## 🧪 Testing with cURL

### Add Human Detection
```bash
curl -X POST http://localhost:8080/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": 1,
    "x": 100,
    "y": 50,
    "width": 80,
    "height": 60,
    "label": "Hotspot",
    "modifiedBy": "test@example.com"
  }'
```

### Edit Detection
```bash
curl -X PUT http://localhost:8080/api/anomalies/1 \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": 1,
    "x": 105,
    "y": 55,
    "width": 90,
    "height": 70,
    "label": "Hotspot",
    "userComments": "Resized box",
    "modifiedBy": "test@example.com"
  }'
```

### Soft Delete
```bash
curl -X DELETE "http://localhost:8080/api/anomalies/1?deletedBy=test@example.com"
```

### Verify Analysis
```bash
curl -X PUT "http://localhost:8080/api/thermal/1/verify?reviewedBy=test@example.com"
```

---

## 📁 Files Created

1. **DTOs:**
   - `AnomalyDetectionRequest.java` - Request body for add/edit
   - `VerifyAnalysisRequest.java` - Request body for verification

2. **Service:**
   - `AnomalyDetectionService.java` - Business logic with AI snapshot

3. **Controller:**
   - `AnomalyDetectionController.java` - REST endpoints

4. **Updated:**
   - `ThermalAnalysisService.java` - Added `verifyAnalysis()` method
   - `ThermalAnalysisController.java` - Added `PUT /{id}/verify` endpoint

---

## 🎉 Phase 4 Complete!

All endpoints are implemented and ready for frontend integration. The system now fully supports:
- ✅ AI Write → Human Edit workflow
- ✅ Preservation of AI predictions for retraining (FR3.3)
- ✅ Rich annotation status tracking
- ✅ Soft deletes (no data loss)
- ✅ Complete audit trail

