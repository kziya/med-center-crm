CREATE OR REPLACE FUNCTION create_monthly_partitions(
    parent_table_name TEXT,
    start_date DATE,
    end_date DATE
)
RETURNS void AS
$$
DECLARE
current_date_var DATE;
    next_date DATE;
    partition_name TEXT;
sql TEXT;
BEGIN
    current_date_var := start_date;

    WHILE current_date_var < end_date LOOP
        next_date := (current_date_var + INTERVAL '1 month')::DATE;

        partition_name := parent_table_name || '_' || TO_CHAR(current_date_var, 'YYYY_MM');

sql := format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L);',
            partition_name,
            parent_table_name,
            current_date_var,
            next_date
        );

EXECUTE sql;

current_date_var := next_date;
END LOOP;
END;
$$ LANGUAGE plpgsql;

--- Tables

-- USERS
CREATE TABLE users (
                     user_id SERIAL PRIMARY KEY,
                     gender VARCHAR(20) NOT NULL,
                     email VARCHAR(150) UNIQUE NOT NULL,
                     password_hash VARCHAR(255) NOT NULL,
                     full_name VARCHAR(100) NOT NULL,
                     role VARCHAR(20) CHECK (role IN ('super_admin', 'admin', 'doctor', 'patient')) NOT NULL,
                     status VARCHAR(20) CHECK (status IN ('active', 'blocked', 'archived', 'pending')) NOT NULL,
                     created_at TIMESTAMP DEFAULT now(),
                     updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX udx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

-- USER CONTACTS
CREATE TABLE user_contacts (
                             user_contact_id SERIAL PRIMARY KEY,
                             user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                             phone VARCHAR(30),
                             address VARCHAR(255),
                             details TEXT,
                             created_at TIMESTAMP DEFAULT now(),
                             updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX udx_uc_user_id ON user_contacts (user_id);

-- DOCTOR PROFILES
CREATE TABLE doctor_details (
                              doctor_detail_id SERIAL PRIMARY KEY,
                              user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
                              specialty VARCHAR(100),
                              license_number VARCHAR(50),
                              education VARCHAR(255),
                              career_summary TEXT,
                              availability JSONB,
                              created_at TIMESTAMP DEFAULT now(),
                              updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX udx_dd_user_id ON doctor_details (user_id);

-- PATIENT PROFILES
CREATE TABLE patient_details (
                               patient_detail_id SERIAL PRIMARY KEY,
                               user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
                               dob DATE,
                               insurance_provider VARCHAR(100),
                               allergies TEXT[],
                               created_at TIMESTAMP DEFAULT now(),
                               updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_pd_user_id ON doctor_details (user_id);

-- DOCTOR-PATIENT ASSIGNMENTS
CREATE TABLE doctor_patient_assignments (
                                          doctor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                                          patient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                                          assigned_at TIMESTAMP DEFAULT now(),
                                          PRIMARY KEY (doctor_id, patient_id)
);

CREATE UNIQUE INDEX idx_dp_doctor_relation ON doctor_patient_assignments(doctor_id, patient_id);

-- APPOINTMENTS
CREATE TABLE appointments (
                            appointment_id SERIAL PRIMARY KEY,
                            doctor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                            patient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                            appointment_time TIMESTAMP NOT NULL,
                            status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) NOT NULL,
                            doctor_notes TEXT,
                            patient_notes TEXT,
                            created_at TIMESTAMP DEFAULT now(),
                            updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_appointment_doctor_list ON appointments (doctor_id, status);
CREATE INDEX idx_appointment_patient_list ON appointments (patient_id, status);
CREATE INDEX idx_appointment_doctor_patient ON appointments (doctor_id, patient_id);

-- APPOINTMENT DETAILS
CREATE TABLE appointment_details (
                                   appointment_detail_id SERIAL PRIMARY KEY,
                                   appointment_id INTEGER UNIQUE REFERENCES appointments(appointment_id) ON DELETE CASCADE,
                                   diagnosis TEXT,
                                   treatment_plan TEXT,
                                   notes TEXT,
                                   created_at TIMESTAMP DEFAULT now(),
                                   updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX udx_ad_appointment_id ON appointment_details (appointment_id);

-- LAB / TEST RESULTS
CREATE TABLE lab_results (
                                   lab_results SERIAL PRIMARY KEY,
                                   patient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                                   doctor_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
                                   appointment_id INTEGER REFERENCES appointments(appointment_id) ON DELETE SET NULL,
                                   test_type VARCHAR(100) NOT NULL,
                                   test_name VARCHAR(150) NOT NULL,
                                   result TEXT,
                                   result_date TIMESTAMP DEFAULT now(),
                                   notes TEXT,
                                   created_at TIMESTAMP DEFAULT now(),
                                   updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_plr_doctor_list ON lab_results (doctor_id, test_type);
CREATE INDEX idx_plr_patient_list ON lab_results (patient_id, test_type);
CREATE INDEX idx_plr_doctor_patient ON lab_results (doctor_id, patient_id);

CREATE TABLE activity_logs (
                             activity_log_id SERIAL,
                             user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
                             entity_id INTEGER NOT NULL,
                             entity_type VARCHAR(50) NOT NULL,
                             action_type VARCHAR(30)  NOT NULL,
                             ip_address VARCHAR(45),
                             metadata JSON,
                             created_at TIMESTAMP DEFAULT now(),
                             updated_at TIMESTAMP DEFAULT now(),
                             PRIMARY KEY (activity_log_id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_al_user_id ON activity_logs (user_id, action_type);
CREATE INDEX idx_al_entity_type ON activity_logs (entity_type);
CREATE INDEX idx_al_action_type ON activity_logs (action_type);

SELECT create_monthly_partitions('activity_logs'::text, NOW()::DATE, (NOW() +  INTERVAL '2 months')::DATE);
