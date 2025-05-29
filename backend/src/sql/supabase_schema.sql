-- Esquema de base de datos para CowTracker en Supabase
-- Basado en la migración desde Firebase

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    descripcion VARCHAR NOT NULL
);

-- Tabla de autenticación (conecta con Auth de Supabase)
CREATE TABLE IF NOT EXISTS autentificar (
    id_autentificar UUID PRIMARY KEY REFERENCES auth.users(id),
    correo VARCHAR NOT NULL,
    contrasena VARCHAR NOT NULL
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    primer_nombre VARCHAR NOT NULL,
    segundo_nombre VARCHAR,
    primer_apellido VARCHAR NOT NULL,
    segundo_apellido VARCHAR,
    id_autentificar UUID REFERENCES autentificar(id_autentificar),
    id_rol INTEGER REFERENCES rol(id_rol)
);

-- Tabla de estado de salud del ganado
CREATE TABLE IF NOT EXISTS estado_salud (
    id_estado_salud SERIAL PRIMARY KEY,
    descripcion VARCHAR NOT NULL
);

-- Tabla de género del ganado
CREATE TABLE IF NOT EXISTS genero (
    id_genero SERIAL PRIMARY KEY,
    descripcion VARCHAR NOT NULL
);

-- Tabla de información veterinaria
CREATE TABLE IF NOT EXISTS informacion_veterinaria (
    id_informacion_veterinaria SERIAL PRIMARY KEY,
    fecha_tratamiento TIMESTAMP DEFAULT NOW(),
    diagnostico VARCHAR,
    tratamiento VARCHAR,
    nota VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de producción
CREATE TABLE IF NOT EXISTS produccion (
    id_produccion SERIAL PRIMARY KEY,
    descripcion VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de fincas
CREATE TABLE IF NOT EXISTS finca (
    id_finca SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    ubicacion VARCHAR,
    tamano INTEGER DEFAULT 0,
    id_usuario INTEGER REFERENCES usuario(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de ganado
CREATE TABLE IF NOT EXISTS ganado (
    id_ganado SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    numero_identificacion INTEGER,
    precio_compra INTEGER DEFAULT 0,
    nota VARCHAR,
    id_informacion_veterinaria INTEGER REFERENCES informacion_veterinaria(id_informacion_veterinaria),
    id_produccion INTEGER REFERENCES produccion(id_produccion),
    id_estado_salud INTEGER REFERENCES estado_salud(id_estado_salud),
    id_genero INTEGER REFERENCES genero(id_genero),
    id_finca INTEGER REFERENCES finca(id_finca),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar roles iniciales
INSERT INTO rol (descripcion) VALUES ('admin') ON CONFLICT DO NOTHING;
INSERT INTO rol (descripcion) VALUES ('user') ON CONFLICT DO NOTHING;
INSERT INTO rol (descripcion) VALUES ('veterinario') ON CONFLICT DO NOTHING;

-- Insertar estados de salud iniciales
INSERT INTO estado_salud (descripcion) VALUES ('Saludable') ON CONFLICT DO NOTHING;
INSERT INTO estado_salud (descripcion) VALUES ('Enfermo') ON CONFLICT DO NOTHING;
INSERT INTO estado_salud (descripcion) VALUES ('En tratamiento') ON CONFLICT DO NOTHING;
INSERT INTO estado_salud (descripcion) VALUES ('Crítico') ON CONFLICT DO NOTHING;

-- Insertar géneros iniciales
INSERT INTO genero (descripcion) VALUES ('Macho') ON CONFLICT DO NOTHING;
INSERT INTO genero (descripcion) VALUES ('Hembra') ON CONFLICT DO NOTHING;

-- Función para sincronizar usuarios desde auth.users a autentificar
CREATE OR REPLACE FUNCTION sincronizar_usuario_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en autentificar
    INSERT INTO autentificar (id_autentificar, correo, contrasena)
    VALUES (NEW.id, NEW.email, '');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar usuarios automáticamente
DROP TRIGGER IF EXISTS trigger_sincronizar_usuario_auth ON auth.users;
CREATE TRIGGER trigger_sincronizar_usuario_auth
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sincronizar_usuario_auth();

-- Políticas de seguridad RLS para Supabase

-- Política para usuarios (solo administradores pueden ver todos los usuarios)
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuario
FOR SELECT USING (auth.uid() = id_autentificar);

CREATE POLICY "Los administradores pueden ver todos los perfiles" ON usuario
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM usuario u 
        JOIN rol r ON u.id_rol = r.id_rol 
        WHERE u.id_autentificar = auth.uid() AND r.descripcion = 'admin'
    )
);

-- Política para ganado
ALTER TABLE ganado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver ganado de sus fincas" ON ganado
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM finca f 
        WHERE f.id_finca = ganado.id_finca AND f.id_usuario IN (
            SELECT id FROM usuario WHERE id_autentificar = auth.uid()
        )
    )
);

CREATE POLICY "Los usuarios pueden crear ganado en sus fincas" ON ganado
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM finca f 
        WHERE f.id_finca = ganado.id_finca AND f.id_usuario IN (
            SELECT id FROM usuario WHERE id_autentificar = auth.uid()
        )
    )
);

-- Política para fincas
ALTER TABLE finca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias fincas" ON finca
FOR SELECT USING (
    id_usuario IN (
        SELECT id FROM usuario WHERE id_autentificar = auth.uid()
    )
);

CREATE POLICY "Los usuarios pueden editar sus propias fincas" ON finca
FOR UPDATE USING (
    id_usuario IN (
        SELECT id FROM usuario WHERE id_autentificar = auth.uid()
    )
); 