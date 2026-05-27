# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.1.0] - 2026-05-15

### 🎨 Rediseño Visual

Actualización mayor del sistema de colores de la aplicación.

#### Changed
- **Paleta de colores**: Migración de verde deportivo a azul moderno profesional
  - Primary: #065f46 (verde) → #2563ea (azul brillante)
  - Secondary: #10b981 (verde) → #1e40af (azul oscuro)
  - Accent: #00ff88 (verde neón) → #0ea5e9 (cyan)
- **Modo oscuro**: Actualizado con tonos azules complementarios
  - Primary oscuro: #3b82f6 (azul claro)
  - Mejores contrastes y legibilidad
- **Gráficas**: Nueva paleta multicolor (azul, púrpura, ámbar, cyan, rosa)

#### Fixed
- Icono `Bracket` reemplazado por `GitBranch` (error de importación de lucide-react)
- Login funcional: todos los botones ahora redirigen correctamente al Dashboard
- Banner de modo demo agregado en página de autenticación

---

## [1.0.0] - 2026-05-15

### 🎉 Lanzamiento Inicial

Primera versión de Foot-B - Plataforma de Gestión de Torneos de Fútbol.

### ✨ Agregado

#### Páginas
- **Landing Page** - Página de inicio con hero, características y footer
- **Dashboard** - Panel principal con resumen de torneos y estadísticas
- **Torneos** - Lista y gestión de torneos
- **Detalle de Torneo** - Vista completa de un torneo específico
- **Equipos** - Gestión de equipos con estadísticas
- **Jugadores** - Gestión de jugadores con tabla y top goleadores
- **Partidos** - Calendario de partidos con estados (vivo, programado, finalizado)
- **Tabla de Posiciones** - Clasificación completa con estadísticas
- **Brackets** - Llaves eliminatorias visuales
- **Autenticación** - Login y registro (UI)

#### Componentes
- **Layout Components**
  - Navbar con theme toggle
  - Sidebar con navegación
  - DashboardLayout wrapper

- **UI Components**
  - StatCard - Tarjeta de estadística reutilizable
  - PlayerCard - Tarjeta visual de jugador
  - ProgressCard - Tarjeta con barra de progreso
  - SearchBar - Barra de búsqueda con clear
  - StatsChart - Gráfico de barras con Recharts

#### Features
- **Diseño Deportivo Moderno**
  - Paleta verde oscuro, negro, blanco
  - Gradientes deportivos
  - Modo oscuro y claro
  - Animaciones suaves con Motion

- **Datos Mock Completos**
  - 3 torneos de ejemplo
  - 6 equipos con estadísticas
  - 5 jugadores con goles y tarjetas
  - 3 partidos en diferentes estados
  - Tabla de posiciones actualizada

- **Navegación**
  - React Router DOM 7
  - 10 rutas configuradas
  - Navegación fluida entre páginas

- **TypeScript**
  - Interfaces completas
  - Type safety en toda la app
  - Custom hooks tipados

#### Utilidades
- **Hooks**
  - `useTournament` - Obtener torneo por ID
  - `useTournaments` - Lista de torneos con filtros
  - `useTopScorers` - Top goleadores
  - `useTopAssists` - Top asistencias
  - `useTeamStats` - Estadísticas de equipo
  - `useTournamentStats` - Estadísticas de torneo

- **Helpers**
  - Formateadores de fecha
  - Calculadoras de porcentajes
  - Formateadores de score

- **Constantes**
  - Formatos de torneo
  - Estados de partidos
  - Posiciones de jugadores
  - Sistema de puntos

#### Documentación
- README completo con descripción del proyecto
- CONTRIBUTING con guía de desarrollo
- DEPLOYMENT con instrucciones de despliegue
- FEATURES con roadmap completo
- CHANGELOG (este archivo)

#### Tecnologías
- React 18.3
- React Router DOM 7.15
- TypeScript
- Tailwind CSS 4
- Radix UI (componentes)
- Recharts (gráficas)
- Lucide React (iconos)
- Motion (animaciones)
- Next Themes (theme toggle)
- Sonner (notificaciones)

### 🎨 Diseño

- Design system deportivo completo
- Variables CSS customizadas
- Colores temáticos:
  - Primary: Verde oscuro (#065f46)
  - Secondary: Verde brillante (#10b981)
  - Accent: Verde neón (#00ff88)
- Responsive design para móvil, tablet y desktop

### 📱 Responsive

- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Navegación adaptativa
- Layouts flexibles

### ♿ Accesibilidad

- Semantic HTML
- ARIA labels en botones
- Keyboard navigation
- Focus indicators
- Color contrast WCAG AA

### 🚀 Performance

- Code splitting automático con React Router
- Lazy loading de componentes
- Optimización de renders con useMemo
- Bundle size optimizado

### 📦 Build

- Vite 6 como bundler
- PostCSS para Tailwind
- TypeScript strict mode
- Tree shaking automático

### 🧪 Calidad de Código

- TypeScript strict
- ESLint configurado
- Prettier ready
- Componentes modulares

---

## [Unreleased]

### Planeado para v2.0
- Integración con Supabase
- Autenticación real
- Backend completo
- Tiempo real con WebSockets
- Sistema de roles
- Exportación PDF

### Considerando para el futuro
- PWA completa
- Notificaciones push
- Streaming de partidos
- IA para análisis
- Multi-idioma
- Mobile app nativa

---

## Formato del Changelog

### Tipos de cambios
- `Added` - Nuevas características
- `Changed` - Cambios en funcionalidad existente
- `Deprecated` - Características que serán removidas
- `Removed` - Características removidas
- `Fixed` - Corrección de bugs
- `Security` - Vulnerabilidades corregidas

### Versionado
Seguimos Semantic Versioning (MAJOR.MINOR.PATCH):
- MAJOR: Cambios incompatibles con versiones anteriores
- MINOR: Nueva funcionalidad compatible con versiones anteriores
- PATCH: Corrección de bugs compatible con versiones anteriores

---

**Nota**: Esta es la primera versión pública de Foot-B. Todos los cambios futuros serán documentados en este archivo.
