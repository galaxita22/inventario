DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
        CREATE TYPE user_role AS ENUM ('aprobador', 'solicitante'); 
    END IF; 
END $$;

DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'usuario') THEN 
        CREATE USER usuario WITH PASSWORD 'contrasena'; 
    END IF; 
END $$;

GRANT CONNECT ON DATABASE mi_proyecto TO usuario;
GRANT USAGE, CREATE ON SCHEMA public TO usuario;