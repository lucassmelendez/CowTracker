-- Script SQL para corregir la estructura de tablas en Supabase
-- Basado en la estructura existente mostrada en la imagen

-- 1. Asegurarse de que las tablas y relaciones existan correctamente

-- Verificar si existe la tabla rol, si no, crearla
CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    descripcion VARCHAR NOT NULL
);

-- Verificar si existe la tabla autentificar, si no, crearla
CREATE TABLE IF NOT EXISTS autentificar (
    id_autentificar UUID PRIMARY KEY REFERENCES auth.users(id),
    correo VARCHAR NOT NULL,
    contrasena VARCHAR NOT NULL
);

-- Verificar si existe la tabla usuario, si no, crearla
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    primer_nombre VARCHAR NOT NULL,
    segundo_nombre VARCHAR,
    primer_apellido VARCHAR NOT NULL,
    segundo_apellido VARCHAR,
    id_rol INTEGER REFERENCES rol(id_rol),
    id_autentificar UUID REFERENCES autentificar(id_autentificar)
);

-- Verificar si existe la tabla genero, si no, crearla
CREATE TABLE IF NOT EXISTS genero (
    id_genero SERIAL PRIMARY KEY,
    descripcion VARCHAR NOT NULL
);

-- Verificar si existe la tabla estado_salud, si no, crearla
CREATE TABLE IF NOT EXISTS estado_salud (
    id_estado_salud SERIAL PRIMARY KEY,
    descripcion VARCHAR NOT NULL
);

-- Verificar si existe la tabla informacion_veterinaria, si no, crearla
CREATE TABLE IF NOT EXISTS informacion_veterinaria (
    id_informacion_veterinaria SERIAL PRIMARY KEY,
    fecha_tratamiento TIMESTAMP,
    diagnostico VARCHAR,
    tratamiento VARCHAR,
    nota VARCHAR
);

-- Verificar si existe la tabla produccion, si no, crearla
CREATE TABLE IF NOT EXISTS produccion (
    id_produccion SERIAL PRIMARY KEY,
    descripcion VARCHAR
);

-- Verificar si existe la tabla finca, si no, crearla
CREATE TABLE IF NOT EXISTS finca (
    id_finca SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    tamano INTEGER,
    id_usuario INTEGER REFERENCES usuario(id)
);

-- Verificar si existe la tabla ganado, si no, crearla
CREATE TABLE IF NOT EXISTS ganado (
    id_ganado SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    numero_identificacion INTEGER,
    precio_compra INTEGER,
    nota VARCHAR,
    id_informacion_veterinaria INTEGER REFERENCES informacion_veterinaria(id_informacion_veterinaria),
    id_produccion INTEGER REFERENCES produccion(id_produccion),
    id_estado_salud INTEGER REFERENCES estado_salud(id_estado_salud),
    id_genero INTEGER REFERENCES genero(id_genero),
    id_finca INTEGER REFERENCES finca(id_finca)
);

-- 2. Insertar datos iniciales si no existen

-- Insertar roles si no existen
INSERT INTO rol (descripcion) VALUES ('admin') ON CONFLICT DO NOTHING;
INSERT INTO rol (descripcion) VALUES ('user') ON CONFLICT DO NOTHING;
INSERT INTO rol (descripcion) VALUES ('veterinario') ON CONFLICT DO NOTHING;

-- Insertar géneros si no existen
INSERT INTO genero (descripcion) VALUES ('Macho') ON CONFLICT DO NOTHING;
INSERT INTO genero (descripcion) VALUES ('Hembra') ON CONFLICT DO NOTHING;

-- Insertar estados de salud si no existen
INSERT INTO estado_salud (descripcion) VALUES ('Saludable') ON CONFLICT DO NOTHING;
INSERT INTO estado_salud (descripcion) VALUES ('Enfermo') ON CONFLICT DO NOTHING;
INSERT INTO estado_salud (descripcion) VALUES ('En tratamiento') ON CONFLICT DO NOTHING;
INSERT INTO estado_salud (descripcion) VALUES ('Crítico') ON CONFLICT DO NOTHING;

-- 3. Crear una vista para simplificar consultas
CREATE OR REPLACE VIEW usuario_completo AS
SELECT 
    u.id,
    u.primer_nombre,
    u.segundo_nombre,
    u.primer_apellido,
    u.segundo_apellido,
    a.correo AS email,
    u.id_autentificar,
    r.descripcion AS rol,
    u.id_rol
FROM 
    usuario u
JOIN 
    autentificar a ON u.id_autentificar = a.id_autentificar
LEFT JOIN 
    rol r ON u.id_rol = r.id_rol;

-- 4. Crear función para sincronizar usuarios desde auth
CREATE OR REPLACE FUNCTION sincronizar_usuario_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en autentificar
    INSERT INTO autentificar (id_autentificar, correo, contrasena)
    VALUES (NEW.id, NEW.email, '');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para la sincronización automática
DROP TRIGGER IF EXISTS trigger_sincronizar_usuario_auth ON auth.users;
CREATE TRIGGER trigger_sincronizar_usuario_auth
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sincronizar_usuario_auth();

-- 6. Configurar políticas de seguridad (RLS)
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE autentificar ENABLE ROW LEVEL SECURITY;
ALTER TABLE ganado ENABLE ROW LEVEL SECURITY;
ALTER TABLE finca ENABLE ROW LEVEL SECURITY;

-- Políticas para usuario
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver su propio perfil" ON usuario
FOR SELECT USING (auth.uid() = id_autentificar);

CREATE POLICY IF NOT EXISTS "Los administradores pueden ver todos los perfiles" ON usuario
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM usuario u 
        JOIN rol r ON u.id_rol = r.id_rol 
        WHERE u.id_autentificar = auth.uid() AND r.descripcion = 'admin'
    )
);

-- Políticas para autentificar
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver sus propios datos de autenticación" 
ON autentificar FOR SELECT 
USING (auth.uid() = id_autentificar);

-- Políticas para finca
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver sus propias fincas" ON finca
FOR SELECT USING (
    id_usuario IN (
        SELECT id FROM usuario WHERE id_autentificar = auth.uid()
    )
);

-- Políticas para ganado
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver ganado de sus fincas" ON ganado
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM finca f 
        WHERE f.id_finca = ganado.id_finca AND f.id_usuario IN (
            SELECT id FROM usuario WHERE id_autentificar = auth.uid()
        )
    )
); 