# 🏛️ Sistema de Elección y Coordinaciones Pastorales
### Seminario Mayor Santo Tomás de Aquino — Arquidiócesis de Maracaibo

Plataforma en tiempo real para la elección canónica del **Coordinador General** y la asignación pastoral en las **4 Coordinaciones** (Liturgia, Cultura, Cocina y Servicios Generales), con soporte para transmisión en Televisor, control desde Tablet para el Padre Rector y votación móvil para los seminaristas.

---

## 🌟 Características Principales

1. **Pantalla Gigante de Escrutinio (`/tv`)**:
   - Transmisión en tiempo real con WebSocket para televisor (1080p / 4K).
   - Medidor canónico de participación en vivo y visualización de resultados.
   - Efectos de sonido orquestados y fanfarria de proclamación del ganador.
   - Tablero final de distribución pastoral ajustado al 100% de la pantalla sin cortes.

2. **Mando del Padre Rector (`/admin`)**:
   - Panel de control integral para apertura de vueltas, suspenso y proclamación.
   - **Arrastrar y Soltar (Drag & Drop)**: Asignación interactiva de seminaristas a las cuatro coordinaciones pastorales.
   - **Tocar para Colocar (Tap-to-Place)**: Acceso rápido para pantallas táctiles.
   - Gestión fotográfica de candidatos y control de asistencia al sufragio.

3. **Votación Móvil para Seminaristas (`/votar`)**:
   - Acceso mediante cédula de identidad y validación por padrón canónico.
   - Votación secreta para Primera y Segunda Vuelta (balotaje).

4. **Base de Datos Supabase Aislada (Zero-Conflict)**:
   - Esquema completamente aislado bajo el prefijo `coord_*`:
     - `coord_seminaristas`
     - `coord_election_state`
     - `coord_votes`
     - `coord_audit_log`
   - Diseñado para convivir pacíficamente en proyectos compartidos de Supabase sin tocar ni sobreescribir tablas de otras aplicaciones.
   - Tolerancia a fallos: persistencia dual (archivo local + nube). Si Supabase está offline, el sistema continúa funcionando al 100% en la red local.

---

## 🚀 Inicio Rápido

### 1. Requisitos
- Node.js 18+ instalado.

### 2. Instalación
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copia `.env.example` a `.env` y configura tus credenciales de Supabase:
```env
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Base de Datos Supabase (Opcional)
Ejecuta el script SQL ubicado en `supabase/schema.sql` en el SQL Editor de tu consola de Supabase.

Para sincronizar los 38 seminaristas y el estado actual a la nube:
```bash
npm run db:push
```

### 5. Iniciar la Aplicación
```bash
# Iniciar servidor completo (API + WebSockets + Frontend compilado)
npm start
```

---

## 📱 Enlaces de la Red

- **Televisor**: `http://localhost:3001/tv`
- **Tablet Padre**: `http://localhost:3001/admin`
- **Votación Seminaristas**: `http://localhost:3001/votar`

---

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Canvas Confetti, Web Audio API.
- **Backend**: Node.js, Express, Socket.IO, Multer, Dotenv.
- **Base de Datos & Nube**: Supabase (@supabase/supabase-js), PostgreSQL, RLS.
- **Red Local**: Autodetección de IP IPv4 para acceso multi-dispositivo sin internet.
