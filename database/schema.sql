-- States dimension
CREATE TABLE states (
    state_code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts dimension
CREATE TABLE districts (
    district_code VARCHAR(10) PRIMARY KEY,
    state_code VARCHAR(10) REFERENCES states(state_code),
    name VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100),
    centroid_lat DECIMAL(10, 8),
    centroid_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly facts table
CREATE TABLE facts_mgnrega_monthly (
    id SERIAL PRIMARY KEY,
    state_code VARCHAR(10) REFERENCES states(state_code),
    district_code VARCHAR(10) REFERENCES districts(district_code),
    fin_year VARCHAR(10) NOT NULL, -- e.g., '2024-2025'
    month INTEGER NOT NULL, -- 1-12
    
    -- Work metrics
    households_demanded INTEGER,
    households_provided INTEGER,
    persons_worked INTEGER,
    person_days DECIMAL(15, 2),
    avg_days_per_household DECIMAL(10, 2),
    
    -- Wage metrics
    avg_wage_rate DECIMAL(10, 2),
    total_wages_paid DECIMAL(15, 2),
    wages_paid_within_15days DECIMAL(15, 2),
    pending_wage_amount DECIMAL(15, 2),
    
    -- Expenditure metrics
    material_expenditure DECIMAL(15, 2),
    admin_expenditure DECIMAL(15, 2),
    total_expenditure DECIMAL(15, 2),
    
    -- Works metrics
    works_started INTEGER,
    works_ongoing INTEGER,
    works_completed INTEGER,
    
    -- Special categories
    women_persondays DECIMAL(15, 2),
    sc_persondays DECIMAL(15, 2),
    st_persondays DECIMAL(15, 2),
    
    -- Metadata
    data_source VARCHAR(20), -- 'OGD' or 'MIS'
    source_url TEXT,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(district_code, fin_year, month)
);

CREATE INDEX idx_district_month ON facts_mgnrega_monthly(district_code, fin_year, month);
CREATE INDEX idx_state_month ON facts_mgnrega_monthly(state_code, fin_year, month);

-- Seed Haryana state
INSERT INTO states (state_code, name, name_hi) VALUES 
('12', 'Haryana', 'हरियाणा');

-- Seed Haryana districts (based on MIS)
INSERT INTO districts (district_code, state_code, name, name_hi) VALUES
('1201', '12', 'Ambala', 'अंबाला'),
('1202', '12', 'Yamunanagar', 'यमुनानगर'),
('1203', '12', 'Kurukshetra', 'कुरुक्षेत्र'),
('1204', '12', 'Kaithal', 'कैथल'),
('1205', '12', 'Karnal', 'करनाल'),
('1206', '12', 'Panipat', 'पानीपत'),
('1207', '12', 'Sonipat', 'सोनीपत'),
('1208', '12', 'Rohtak', 'रोहतक'),
('1209', '12', 'Jhajjar', 'झज्जर'),
('1210', '12', 'Hisar', 'हिसार'),
('1211', '12', 'Fatehabad', 'फतेहाबाद'),
('1212', '12', 'Sirsa', 'सिरसा'),
('1213', '12', 'Jind', 'जींद'),
('1214', '12', 'Bhiwani', 'भिवानी'),
('1215', '12', 'Mahendragarh', 'महेंद्रगढ़'),
('1216', '12', 'Rewari', 'रेवाड़ी'),
('1217', '12', 'Gurgaon', 'गुड़गांव'),
('1218', '12', 'Faridabad', 'फरीदाबाद'),
('1219', '12', 'Mewat', 'मेवात'),
('1220', '12', 'Palwal', 'पलवल'),
('1221', '12', 'Panchkula', 'पंचकुला'),
('1222', '12', 'Charkhi Dadri', 'चरखी दादरी');
