CREATE TABLE IF NOT EXISTS "user" (
    user_id serial PRIMARY KEY,
    email VARCHAR(64) NOT NULL,
    password VARCHAR(64),

    CONSTRAINT user_email_key UNIQUE (email)
);

DO $$
BEGIN
    ALTER TABLE "user" ALTER COLUMN email SET NOT NULL;
    ALTER TABLE "user" ADD CONSTRAINT user_email_key UNIQUE (email);
EXCEPTION
    WHEN others THEN RAISE NOTICE 'Constraint user.email unique already exists';
END $$;
