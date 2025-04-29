--- Functions
CREATE OR REPLACE FUNCTION create_monthly_partitions(
    parent_table_name TEXT,
    start_date DATE,
    end_date DATE
)
RETURNS void AS
$$
DECLARE
current_date DATE := start_date;
    next_date DATE;
    partition_name TEXT;
sql TEXT;
BEGIN
    WHILE current_date < end_date LOOP
        next_date := (current_date + INTERVAL '1 month')::DATE;

        -- Generate partition name like "parent_2024_05"
        partition_name := parent_table_name || '_' || TO_CHAR(current_date, 'YYYY_MM');

        -- Build dynamic SQL
sql := format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L);',
            partition_name,
            parent_table_name,
            current_date,
            next_date
        );

        -- Execute dynamic SQL
EXECUTE sql;

-- Move to next month
current_date := next_date;
END LOOP;
END;
$$ LANGUAGE plpgsql;

--- Tables

-- USERS
CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(150) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     full_name VARCHAR(100) NOT NULL,
     profile_picture_url VARCHAR(255),
     role VARCHAR(20) CHECK (role IN ('super_admin', 'admin', 'doctor', 'patient')) NOT NULL,
     status VARCHAR(20) CHECK (status IN ('active', 'blocked', 'archived', 'pending')) NOT NULL,
     created_at TIMESTAMP DEFAULT now(),
     updated_at TIMESTAMP DEFAULT now()
);

-- USER CONTACTS
CREATE TABLE user_contacts (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     phone VARCHAR(30),
     address VARCHAR(255),
     details TEXT,
     created_at TIMESTAMP DEFAULT now(),
     updated_at TIMESTAMP DEFAULT now()
);

-- DOCTOR PROFILES
CREATE TABLE doctor_details (
     id SERIAL PRIMARY KEY,
     user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
     specialty VARCHAR(100),
     license_number VARCHAR(50),
     education VARCHAR(255),
     career_summary TEXT,
     availability JSONB,
     created_at TIMESTAMP DEFAULT now(),
     updated_at TIMESTAMP DEFAULT now()
);

-- PATIENT PROFILES
CREATE TABLE patient_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    dob DATE,
    insurance_provider VARCHAR(100),
    allergies TEXT[],
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- DOCTOR-PATIENT ASSIGNMENTS
CREATE TABLE doctor_patient_assignments (
    doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (doctor_id, patient_id)
);

-- APPOINTMENTS
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) NOT NULL,
    doctor_notes TEXT,
    patient_notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- APPOINTMENT DETAILS
CREATE TABLE appointment_details (
   id SERIAL PRIMARY KEY,
   appointment_id INTEGER UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
   visit_date TIMESTAMP NOT NULL,
   diagnosis TEXT,
   treatment_plan TEXT,
   notes TEXT,
   created_at TIMESTAMP DEFAULT now(),
   updated_at TIMESTAMP DEFAULT now()
);

-- LAB / TEST RESULTS
CREATE TABLE patient_lab_results (
   id SERIAL PRIMARY KEY,
   patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
   appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
   test_type VARCHAR(100) NOT NULL,
   test_name VARCHAR(150) NOT NULL,
   result TEXT,
   result_date TIMESTAMP DEFAULT now(),
   notes TEXT,
   created_at TIMESTAMP DEFAULT now(),
   updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE activity_logs (
   id SERIAL PRIMARY KEY,
   user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
   entity_id INTEGER,
   entity_type VARCHAR(50),
   action_type VARCHAR(30) CHECK (
     action_type IN ('create', 'update', 'delete', 'login', 'logout', 'assign', 'review', 'status_change')
     ) NOT NULL,
   ip_address VARCHAR(45),
   details TEXT,
   created_at TIMESTAMP DEFAULT now(),
   updated_at TIMESTAMP DEFAULT now()
);

-- DOCTOR REVIEWS
CREATE TABLE doctor_reviews (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);


