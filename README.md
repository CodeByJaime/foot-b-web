# Foot-B - Plataforma de Gestión de Torneos de Fútbol

Plataforma moderna y completa para la gestión de torneos de fútbol amateur y profesional.

> 🎮 **Versión Demo**: Esta es una versión de demostración con datos mock. No requiere autenticación real - simplemente haz clic en cualquier botón de login para explorar la aplicación.

## Características Principales

### 🏆 Gestión de Torneos
- Múltiples formatos: Liga, Copa, Grupos + Eliminación directa, Personalizado
- Calendario automático de partidos
- Generación automática de llaves eliminatorias
- Configuración flexible de reglas y puntos

### ⚽ Gestión de Equipos y Jugadores
- Registro completo de equipos con escudos y uniformes
- Perfiles detallados de jugadores
- Estadísticas individuales y de equipo
- Historial de partidos

### 📊 Estadísticas en Tiempo Real
- Tabla de posiciones actualizada automáticamente
- Goleadores y asistencias
- Tarjetas amarillas y rojas
- Gráficas y visualizaciones

### 🎯 Características Adicionales
- Marcadores en vivo
- Brackets visuales modernos
- Sistema de roles (Organizador, Árbitro, Jugador, Espectador)
- Modo oscuro/claro
- Diseño completamente responsive

## Tecnologías Utilizadas

- **React 18.3** - Framework principal
- **React Router DOM 7** - Navegación
- **Tailwind CSS 4** - Estilos
- **Radix UI** - Componentes accesibles
- **Recharts** - Gráficas y visualizaciones
- **Lucide React** - Iconos
- **Motion** - Animaciones
- **Next Themes** - Gestión de temas
- **Sonner** - Notificaciones

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── layout/          # Componentes de layout (Navbar, Sidebar, etc.)
│   │   └── ui/              # Componentes reutilizables
│   ├── data/
│   │   └── mockData.ts      # Datos de ejemplo
│   ├── pages/               # Páginas de la aplicación
│   │   ├── LandingPage.tsx  # Página de inicio
│   │   ├── Dashboard.tsx    # Panel principal
│   │   ├── Tournaments.tsx  # Lista de torneos
│   │   ├── Teams.tsx        # Gestión de equipos
│   │   ├── Players.tsx      # Gestión de jugadores
│   │   ├── Matches.tsx      # Calendario de partidos
│   │   ├── Standings.tsx    # Tabla de posiciones
│   │   ├── Brackets.tsx     # Llaves eliminatorias
│   │   └── AuthPage.tsx     # Autenticación
│   └── App.tsx              # Componente principal
└── styles/
    └── theme.css            # Tema y variables CSS
```

## Rutas Disponibles

- `/` - Landing page
- `/auth` - Login/Registro
- `/dashboard` - Panel principal
- `/tournaments` - Lista de torneos
- `/tournaments/:id` - Detalle de torneo
- `/teams` - Gestión de equipos
- `/players` - Gestión de jugadores
- `/matches` - Calendario de partidos
- `/standings/:tournamentId` - Tabla de posiciones
- `/brackets/:tournamentId` - Llaves eliminatorias

## Paleta de Colores

### Modo Claro
- **Primary**: Azul brillante (#2563ea)
- **Secondary**: Azul oscuro (#1e40af)
- **Background**: Blanco (#ffffff)
- **Accent**: Cyan (#0ea5e9)
- **Charts**: Azul, Púrpura, Ámbar, Cyan, Rosa

### Modo Oscuro
- **Primary**: Azul claro (#3b82f6)
- **Secondary**: Azul medio (#2563ea)
- **Background**: Negro (#0a0a0a)
- **Accent**: Cyan (#0ea5e9)
- **Charts**: Azul claro, Púrpura, Ámbar, Cyan, Rosa

## Características de Diseño

- ✅ Diseño deportivo moderno con degradados
- ✅ Animaciones suaves con Motion
- ✅ Cards con efectos hover
- ✅ Tablas responsivas
- ✅ Gráficas interactivas
- ✅ Brackets visuales modernos
- ✅ Modo oscuro completo
- ✅ Totalmente responsive

## Próximas Funcionalidades

- [ ] Integración con Supabase para backend
- [ ] Autenticación real con Google
- [ ] Actualizaciones en tiempo real con WebSockets
- [ ] Sistema de notificaciones push
- [ ] Exportación de datos a PDF
- [ ] Compartir torneos públicamente
- [ ] Sistema de pagos para inscripciones
- [ ] Chat entre organizadores y equipos
- [ ] Aplicación móvil (PWA)

## Datos de Ejemplo

La aplicación incluye datos de ejemplo para demostración:
- 3 torneos (Liga, Copa, Grupos + Eliminación)
- 6 equipos con estadísticas
- 5 jugadores con goles, asistencias y tarjetas
- 3 partidos (finalizado, en vivo, programado)
- Tabla de posiciones completa

## Notas de Desarrollo

Esta es una versión frontend con datos mock. Para funcionalidad completa de backend:
1. Conectar Supabase para base de datos
2. Implementar autenticación real
3. Agregar API para operaciones CRUD
4. Implementar WebSockets para actualizaciones en tiempo real
