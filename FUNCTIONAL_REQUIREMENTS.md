# Functional Requirements

## 1. User Roles

The system must support the following user roles:

- **Administrator**
- **Super Administrator**
- **Doctor**
- **Patient**

Each role will have specific access and functionality as described below.

---

## 2. Common Functionality (All Roles)

- **Authentication**
    - All users must be able to **log in** with a secure username and password.
    - Access must be restricted based on roles.
    - Session or token-based authentication (e.g., JWT) should be implemented.

---

## 3. Super Administrator

- Has **full access** to the system.
- Can manage all Administrators (create, update, delete).
- Can view all system activity logs.
- Has override access to all patient and doctor data.

---

## 4. Administrator

- Can **log in** to the system.
- Can **create, update, or delete**:
    - Doctors
    - Patients
- Can **view**:
    - All doctor profiles and schedules
    - All patient records and visit histories
- Can assign patients to doctors if needed.

---

## 5. Doctor

- Can **log in** to the system.
- Can **view**:
    - Assigned patient medical records
    - Patient visit histories, lab results, etc.
- Can **add/update**:
    - Visit notes
    - Diagnoses
    - Treatment plans
- Cannot access unrelated patient data.

---

## 6. Patient

- Can **register** and **log in**.
- Can **view and update** personal profile (contact info, insurance, etc.).
- Can **view**:
    - Their own medical history
    - Upcoming and past appointments
    - Doctor notes (if permitted)
- Can request an appointment with a doctor.
