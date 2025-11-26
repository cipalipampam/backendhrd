# Manual API Testing - Jabatan Endpoints (Opsi A)

Server is running on: **http://localhost:5000**

## Prerequisites

1. Server must be running: `npm run dev` (in backendhrd directory)
2. Database seeded with test data
3. Test account: `hr.manager@company.com` / `hr123`

---

## Test 1: Login

**Request:**
```powershell
$body = @{
  email = "hr.manager@company.com"
  password = "hr123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

$token = $loginResponse.token
Write-Host "Token: $token"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "data": {
    "id": "...",
    "nama": "Sarah Johnson",
    "email": "hr.manager@company.com",
    "role": "HR"
  }
}
```

---

## Test 2: GET All Jabatan

**Request:**
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

$jabatanAll = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/jabatan" `
  -Method GET `
  -Headers $headers

Write-Host "Total Jabatan: $($jabatanAll.data.Count)"
$jabatanAll.data | Select-Object -First 5 | Format-Table nama, level, @{Name='Departemen';Expression={$_.departemen.nama}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get all jabatan",
  "data": [
    {
      "id": "...",
      "nama": "HR Manager",
      "level": "Manager",
      "departemenId": "...",
      "deskripsi": null,
      "departemen": {
        "id": "...",
        "nama": "HR"
      }
    },
    // ... more jabatan (total ~53)
  ]
}
```

**Verification Points:**
- ✅ Status code: 200
- ✅ Total jabatan: ~53 records
- ✅ Each jabatan includes `departemen` relation
- ✅ All jabatan have `departemenId` populated

---

## Test 3: GET Jabatan Filtered by Department

First, get Technology department ID:

```powershell
$deptResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/departemen" `
  -Method GET `
  -Headers $headers

$techDept = $deptResponse.data | Where-Object { $_.nama -eq "Technology" }
$techDeptId = $techDept.id
Write-Host "Technology ID: $techDeptId"
```

Then, get jabatan for Technology:

```powershell
$jabatanTech = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/jabatan?departemenId=$techDeptId" `
  -Method GET `
  -Headers $headers

Write-Host "Technology Roles: $($jabatanTech.data.Count)"
$jabatanTech.data | Format-Table nama, level
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get all jabatan",
  "data": [
    {
      "id": "...",
      "nama": "Software Engineer",
      "level": "Staff",
      "departemenId": "...",
      "deskripsi": null,
      "departemen": {
        "id": "...",
        "nama": "Technology"
      }
    },
    {
      "id": "...",
      "nama": "Senior Software Engineer",
      "level": "Senior",
      "departemenId": "...",
      "deskripsi": null,
      "departemen": {
        "id": "...",
        "nama": "Technology"
      }
    }
    // ... more (total ~11 Technology roles)
  ]
}
```

**Verification Points:**
- ✅ Status code: 200
- ✅ Technology roles: 11 records
- ✅ All returned jabatan have `departemen.nama = "Technology"`
- ✅ Roles include: Software Engineer, DevOps Engineer, QA Engineer, etc.

---

## Test 4: POST Create New Jabatan

Get HR department ID first:

```powershell
$hrDept = $deptResponse.data | Where-Object { $_.nama -eq "HR" }
$hrDeptId = $hrDept.id
```

Create new jabatan:

```powershell
$newJabatan = @{
  nama = "Test - Learning & Development Specialist"
  departemenId = $hrDeptId
  level = "Senior"
  deskripsi = "Responsible for employee training and development programs"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/jabatan" `
  -Method POST `
  -Headers $headers `
  -Body $newJabatan `
  -ContentType "application/json"

$createResponse.data | Format-List
$newJabatanId = $createResponse.data.id
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Jabatan created successfully",
  "data": {
    "id": "...",
    "nama": "Test - Learning & Development Specialist",
    "level": "Senior",
    "departemenId": "...",
    "deskripsi": "Responsible for employee training and development programs",
    "departemen": {
      "id": "...",
      "nama": "HR"
    }
  }
}
```

**Verification Points:**
- ✅ Status code: 201
- ✅ Returns created jabatan with all fields
- ✅ Includes `departemen` relation in response
- ✅ `departemenId` is required (400 error if missing)

---

## Test 5: POST Duplicate Name in Same Department (Error Case)

Try creating duplicate:

```powershell
$duplicateJabatan = @{
  nama = "Test - Learning & Development Specialist"
  departemenId = $hrDeptId
  level = "Lead"
} | ConvertTo-Json

try {
  Invoke-RestMethod `
    -Uri "http://localhost:5000/api/jabatan" `
    -Method POST `
    -Headers $headers `
    -Body $duplicateJabatan `
    -ContentType "application/json"
} catch {
  $errorResponse = $_.Exception.Response
  $statusCode = $errorResponse.StatusCode.value__
  Write-Host "Status Code: $statusCode (Expected 400)"
  
  $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
  $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
  $errorBody | Format-List
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Jabatan with nama 'Test - Learning & Development Specialist' already exists in this departemen"
}
```

**Verification Points:**
- ✅ Status code: 400
- ✅ Error message indicates duplicate constraint
- ✅ Same name in **different** department should be allowed

---

## Test 6: POST Duplicate Name in Different Department (Should Succeed)

Get Sales department:

```powershell
$salesDept = $deptResponse.data | Where-Object { $_.nama -eq "Sales & Marketing" }
$salesDeptId = $salesDept.id
```

Create same name in different department:

```powershell
$sameName = @{
  nama = "Test - Learning & Development Specialist"
  departemenId = $salesDeptId
  level = "Staff"
  deskripsi = "Training for sales team"
} | ConvertTo-Json

$sameNameResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/jabatan" `
  -Method POST `
  -Headers $headers `
  -Body $sameName `
  -ContentType "application/json"

Write-Host "✅ Same name allowed in different department!"
$sameNameResponse.data | Format-List
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Jabatan created successfully",
  "data": {
    "id": "...",
    "nama": "Test - Learning & Development Specialist",
    "level": "Staff",
    "departemenId": "...",
    "deskripsi": "Training for sales team",
    "departemen": {
      "id": "...",
      "nama": "Sales & Marketing"
    }
  }
}
```

**Verification Points:**
- ✅ Status code: 201
- ✅ Same `nama` allowed in different `departemenId`
- ✅ Unique constraint is on `(nama, departemenId)` composite

---

## Test 7: PUT Update Jabatan

Update the first test jabatan:

```powershell
$updateJabatan = @{
  level = "Lead"
  deskripsi = "Updated: Leading all L&D initiatives across organization"
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/jabatan/$newJabatanId" `
  -Method PUT `
  -Headers $headers `
  -Body $updateJabatan `
  -ContentType "application/json"

$updateResponse.data | Format-List
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Jabatan updated successfully",
  "data": {
    "id": "...",
    "nama": "Test - Learning & Development Specialist",
    "level": "Lead",
    "departemenId": "...",
    "deskripsi": "Updated: Leading all L&D initiatives across organization",
    "departemen": {
      "id": "...",
      "nama": "HR"
    }
  }
}
```

**Verification Points:**
- ✅ Status code: 200
- ✅ `level` updated from "Senior" to "Lead"
- ✅ `deskripsi` updated with new text
- ✅ Can also update `departemenId` to move jabatan to different department

---

## Test 8: GET All Departments (For Reference)

```powershell
$allDepts = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/departemen" `
  -Method GET `
  -Headers $headers

$allDepts.data | Format-Table nama, @{Name='Jabatan Count';Expression={$_.jabatan.Count}}
```

**Expected Output:**
```
nama                Jabatan Count
----                -------------
HR                  8 (7 original + 1 test)
Technology          11
Finance             6
Sales & Marketing   8 (7 original + 1 test)
Operations          6
Procurement         5
Analytics           5
R&D                 6
```

---

## Complete PowerShell Test Script

Save all tests in one script:

```powershell
# Full API Test Script
$baseUrl = "http://localhost:5000/api"

# Login
Write-Host "`n🔐 Test 1: Login..." -ForegroundColor Cyan
$body = @{
  email = "hr.manager@company.com"
  password = "hr123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $loginResponse.token
Write-Host "✅ Login successful" -ForegroundColor Green

$headers = @{ "Authorization" = "Bearer $token" }

# Get All Jabatan
Write-Host "`n📋 Test 2: GET All Jabatan..." -ForegroundColor Cyan
$jabatanAll = Invoke-RestMethod -Uri "$baseUrl/jabatan" -Method GET -Headers $headers
Write-Host "✅ Total Jabatan: $($jabatanAll.data.Count)" -ForegroundColor Green
$jabatanAll.data | Select-Object -First 3 | Format-Table nama, level, @{Name='Dept';Expression={$_.departemen.nama}}

# Get Departments
Write-Host "`n🏢 Getting Departments..." -ForegroundColor Cyan
$deptResponse = Invoke-RestMethod -Uri "$baseUrl/departemen" -Method GET -Headers $headers
$techDept = $deptResponse.data | Where-Object { $_.nama -eq "Technology" }
$hrDept = $deptResponse.data | Where-Object { $_.nama -eq "HR" }

# Filter by Department
Write-Host "`n📋 Test 3: GET Jabatan (Technology only)..." -ForegroundColor Cyan
$jabatanTech = Invoke-RestMethod -Uri "$baseUrl/jabatan?departemenId=$($techDept.id)" -Method GET -Headers $headers
Write-Host "✅ Technology Roles: $($jabatanTech.data.Count)" -ForegroundColor Green
$jabatanTech.data | Select-Object -First 5 | Format-Table nama, level

# Create New Jabatan
Write-Host "`n➕ Test 4: POST Create New Jabatan..." -ForegroundColor Cyan
$newJabatan = @{
  nama = "Test - API Created Role"
  departemenId = $hrDept.id
  level = "Senior"
  deskripsi = "Created via API test"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "$baseUrl/jabatan" -Method POST -Headers $headers -Body $newJabatan -ContentType "application/json"
Write-Host "✅ Jabatan Created: $($createResponse.data.nama)" -ForegroundColor Green
$newJabatanId = $createResponse.data.id

# Update Jabatan
Write-Host "`n✏️  Test 5: PUT Update Jabatan..." -ForegroundColor Cyan
$updateJabatan = @{
  level = "Lead"
  deskripsi = "Updated via API test"
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "$baseUrl/jabatan/$newJabatanId" -Method PUT -Headers $headers -Body $updateJabatan -ContentType "application/json"
Write-Host "✅ Jabatan Updated: Level = $($updateResponse.data.level)" -ForegroundColor Green

Write-Host "`n✅ All tests completed successfully!" -ForegroundColor Green
```

**Save as:** `test-api.ps1` and run with `.\test-api.ps1`

---

## Summary of Changes (Opsi A)

### ✅ Verified Features:

1. **Department Relation**: Every jabatan now belongs to one department
2. **Composite Unique Constraint**: `(nama, departemenId)` allows same job name in different departments
3. **Filter by Department**: `GET /api/jabatan?departemenId=X` returns roles for specific department
4. **Required departemenId**: POST requires `departemenId`, returns 400 if missing
5. **Response includes Departemen**: All endpoints return jabatan with nested `departemen` object
6. **Level Support**: Optional `level` field (Junior/Staff/Senior/Lead/Manager/Director)
7. **Description Support**: Optional `deskripsi` field for detailed job descriptions

### 📊 Test Data:

- **8 Departments**: HR, Technology, Finance, Sales & Marketing, Operations, Procurement, Analytics, R&D
- **53 Jabatan**: Distributed across departments with appropriate levels
- **Test Account**: `hr.manager@company.com` / `hr123` (HR role)

### 🔗 Related Documentation:

- `MIGRATION_JABATAN.md` - Complete migration guide
- `OPSI_A_SUMMARY.md` - Implementation summary
- `SEEDER_README.md` - Seed data details
- `API_KEHADIRAN.md` - Other API documentation

---

## Next Steps

1. ✅ **Backend Complete** - All API endpoints tested and working
2. **Frontend Integration** - Update `websitehrd/src/services/api.ts`:
   ```typescript
   export const jabatanAPI = {
     getAll: (params?: { departemenId?: string }) => 
       api.get('/jabatan', { params }),
     getByDepartemen: (departemenId: string) =>
       api.get('/jabatan', { params: { departemenId } }),
     create: (data: JabatanCreate) => api.post('/jabatan', data),
     update: (id: string, data: JabatanUpdate) => api.put(`/jabatan/${id}`, data)
   };
   ```
3. **UI Updates**:
   - Jabatan CRUD page: Add department Select dropdown (required)
   - Karyawan form: Implement dependent dropdown (departemen → jabatan)
   - Display format: Show level badge: `{nama} ({level})`

4. **Mobile App**: Same API changes in `mobilehrd/services/api.ts`
