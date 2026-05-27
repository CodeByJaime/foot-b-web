# Guía de Inicio Rápido - Foot-B ⚽

## Bienvenido a Foot-B

Foot-B es tu plataforma completa para gestionar torneos de fútbol de manera profesional y moderna.

## 🚀 Inicio Rápido

### La aplicación ya está lista

El proyecto está completamente configurado y listo para usar. El servidor de desarrollo de Make ya está corriendo.

### Navega por la aplicación

1. **Landing Page** (`/`)
   - Página de inicio con información del producto
   - Hero con call-to-action
   - Características principales
   - Footer completo

2. **Dashboard** (`/dashboard`)
   - Resumen general de todos tus torneos
   - Estadísticas en cards visuales
   - Próximos partidos destacados
   - Actividad reciente

3. **Gestión de Torneos** (`/tournaments`)
   - Lista todos tus torneos
   - Filtra por estado (en curso, próximos, finalizados)
   - Crea nuevos torneos
   - Accede a detalles completos

4. **Equipos** (`/teams`)
   - Visualiza todos los equipos
   - Estadísticas de victorias/empates/derrotas
   - Busca equipos específicos
   - Agrega nuevos equipos

5. **Jugadores** (`/players`)
   - Tabla completa de jugadores
   - Top goleadores destacado
   - Filtra por posición
   - Estadísticas detalladas (goles, asistencias, tarjetas)

6. **Partidos** (`/matches`)
   - Partidos EN VIVO con marcador
   - Próximos partidos programados
   - Resultados finalizados
   - Información de fecha, hora, lugar y árbitro

7. **Tabla de Posiciones** (`/standings/:tournamentId`)
   - Clasificación completa
   - Todas las estadísticas (PJ, PG, PE, PP, GF, GC, DG, PTS)
   - Zonas de clasificación/descenso
   - Mejores ataques y defensas

8. **Brackets** (`/brackets/:tournamentId`)
   - Llaves eliminatorias visuales
   - Semifinales y final
   - Calendario de partidos
   - Diseño responsive

## 📊 Datos de Ejemplo

La aplicación incluye datos de demostración:

### Torneos
- **Liga Amateur Primavera 2026** (En curso)
- **Copa de Verano** (Próximo)
- **Torneo Regional** (Finalizado)

### Equipos
1. Deportivo Estrella ⭐
2. FC Águilas 🦅
3. Unidos FC ⚽
4. Leones del Sur 🦁
5. Atlético Victoria 🏆
6. Tigres Unidos 🐯

### Jugadores Destacados
- **Alejandro Ramírez** - 15 goles (Goleador)
- **Martín Suárez** - 10 asistencias (Mejor asistidor)
- **Gabriel Torres** - 12 goles

## 🎨 Características de Diseño

### Modo Oscuro/Claro
- Click en el icono de sol/luna en el navbar
- Persiste entre sesiones
- Paleta optimizada para ambos modos

### Colores Modernos
- **Azul brillante** (#2563ea) - Primary
- **Azul oscuro** (#1e40af) - Secondary
- **Cyan** (#0ea5e9) - Accent
- **Negro** (#0a0a0a) - Background oscuro
- **Blanco** (#ffffff) - Background claro
- **Charts**: Azul, Púrpura, Ámbar, Cyan, Rosa

### Animaciones
- Transiciones suaves
- Hover effects en cards
- Loading states
- Gradientes deportivos

## 🧭 Navegación

### Sidebar (Desktop)
- Dashboard
- Torneos
- Equipos
- Jugadores
- Partidos
- Estadísticas
- Brackets
- Configuración

### Responsive
- Mobile: Menú hamburguesa
- Tablet: Navegación adaptada
- Desktop: Sidebar completo

## 💡 Casos de Uso

### 1. Ver estadísticas generales
```
Dashboard → Ver cards de resumen
```

### 2. Revisar tabla de posiciones
```
Dashboard → Torneo → Tabla de posiciones
O
Estadísticas → Seleccionar torneo
```

### 3. Ver próximos partidos
```
Dashboard → Sección "Próximos partidos"
O
Partidos → Filtrar por "Programados"
```

### 4. Consultar goleadores
```
Jugadores → Ver top 3 en banner superior
O
Revisar tabla completa ordenada por goles
```

### 5. Ver llaves eliminatorias
```
Brackets → Visualización completa de semifinales y final
```

## 🔧 Personalización

### Agregar tu propio torneo (Conceptual)
Cuando conectes Supabase:
1. Click en "Crear torneo"
2. Selecciona formato (Liga, Copa, etc.)
3. Configura equipos y reglas
4. El sistema genera el calendario automáticamente

### Agregar equipos
1. Ir a "Equipos"
2. Click "Agregar equipo"
3. Completar información (nombre, logo, entrenador)
4. Agregar jugadores

### Programar partidos
1. Ir a "Partidos"
2. Click "Programar partido"
3. Seleccionar equipos, fecha, hora, lugar
4. Asignar árbitro

## 📱 Responsive Design

### Mobile
- Navegación optimizada
- Cards apiladas verticalmente
- Touch-friendly buttons
- Tablas con scroll horizontal

### Tablet
- Layout híbrido
- 2 columnas en grids
- Navegación adaptativa

### Desktop
- Sidebar permanente
- 3-4 columnas en grids
- Hover effects completos

## 🎯 Próximos Pasos

### Para usar la versión completa:
1. **Conectar Supabase** (cuando estés listo)
   - Crea un proyecto en supabase.com
   - Configura las tablas según el schema
   - Conecta desde Make settings

2. **Habilitar autenticación**
   - Configurar Google OAuth
   - Implementar JWT
   - Agregar roles de usuario

3. **Tiempo real**
   - Configurar WebSockets
   - Actualizar marcadores en vivo
   - Notificaciones push

## 🆘 Ayuda

### Problemas comunes

**Las rutas no funcionan:**
- Verifica que estás usando `Link` de react-router-dom
- No uses `<a href>`, usa `<Link to>`

**Los estilos no cargan:**
- Verifica que Tailwind está configurado
- Revisa el archivo `theme.css`

**Los datos no aparecen:**
- Revisa que los datos mock estén importados
- Verifica la consola por errores

### Recursos
- [Documentación completa](README.md)
- [Guía de contribución](CONTRIBUTING.md)
- [Features y roadmap](FEATURES.md)
- [Changelog](CHANGELOG.md)

## 🎉 ¡Disfruta de Foot-B!

Explora todas las características, personaliza los datos mock, y cuando estés listo, conecta Supabase para tener la experiencia completa con backend real.

---

**Tip**: Comienza explorando el Dashboard para tener una vista general de todas las funcionalidades.
