# PhishShield AI

PhishShield is an AI/ML-assisted email phishing detection system with three account roles.

## Roles

### Individual User
- Personal Dashboard
- Analyze Email
- Analysis Result
- Email Hop Visualization
- Personal History
- Personal Reports
- No organization-wide visibility

### Organization User
- Same personal analysis tools as an Individual User
- Dashboard, Analyze Email, Analysis Result, Hop Visualization, History, Reports
- Every scan is stored with the user's organization ID
- The user sees only their own history/reports
- Organization Admin can monitor the user's organization-level activity

### Organization Admin
- Organization Dashboard
- Recent Analysis across organization members
- Phishing Alerts across organization members
- Quarantine view for high-risk phishing scans
- Organization Reports
- Cannot use the personal user interface through the frontend

## Data model

Organization users share an `organization_id`. In this simple project, the email domain is used as the organization ID when an organization account is created. Individual users have no organization ID.

## Run

Backend:
```powershell
cd backend
python app.py
```

Frontend:
```powershell
cd frontend
npm install
npm run dev
```

Both frontend roles that perform personal analysis use the same analysis engine. The important distinction is data ownership and organization visibility: Individual = personal, Organization User = personal + organization membership, Organization Admin = organization-wide monitoring.
