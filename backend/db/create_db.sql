CREATE TYPE currency AS ENUM ('RUB', 'USD', 'EUR');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password bytea NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recurring_payments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency currency NOT NULL,
    billing_day INTEGER NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_occurrences (
    id SERIAL PRIMARY KEY,
    recurring_payment_id INT NOT NULL REFERENCES recurring_payments (id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency currency NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date DATE,
    is_notified BOOLEAN NOT NULL DEFAULT FALSE,
    notified_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (
        recurring_payment_id,
        due_date
    )
);