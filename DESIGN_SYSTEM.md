# Sistema de Diseño - Foot-B

## 🎨 Paleta de Colores

### Colores Principales

#### Modo Claro
```css
--primary: #2563ea        /* Azul brillante - Botones principales, enlaces */
--secondary: #1e40af      /* Azul oscuro - Degradados, fondos */
--accent: #0ea5e9         /* Cyan - Highlights, hover states */
--background: #ffffff     /* Blanco - Fondo general */
--foreground: #0a0a0a     /* Negro - Texto principal */
```

#### Modo Oscuro
```css
--primary: #3b82f6        /* Azul claro - Mayor visibilidad en oscuro */
--secondary: #2563ea      /* Azul medio - Fondos secundarios */
--accent: #0ea5e9         /* Cyan - Consistente en ambos modos */
--background: #0a0a0a     /* Negro - Fondo principal */
--foreground: #ffffff     /* Blanco - Texto principal */
```

### Colores Semánticos

```css
--destructive: #ef4444    /* Rojo - Errores, eliminaciones */
--success: #10b981        /* Verde - Éxitos, confirmaciones */
--warning: #f59e0b        /* Ámbar - Advertencias */
--info: #0ea5e9          /* Cyan - Información */
```

### Colores para Gráficas

```css
--chart-1: #2563ea / #3b82f6    /* Azul principal */
--chart-2: #8b5cf6              /* Púrpura */
--chart-3: #f59e0b              /* Ámbar */
--chart-4: #06b6d4              /* Cyan */
--chart-5: #ec4899              /* Rosa */
```

## 📐 Espaciado

```css
--radius: 0.5rem         /* Radio base para bordes redondeados */
--radius-sm: 0.125rem    /* Radio pequeño */
--radius-md: 0.25rem     /* Radio medio */
--radius-lg: 0.5rem      /* Radio grande */
--radius-xl: 0.875rem    /* Radio extra grande */
```

## 🔤 Tipografía

```css
--font-size: 16px
--font-weight-normal: 400
--font-weight-medium: 500
```

### Jerarquía de Texto

- **h1**: Títulos principales de página
- **h2**: Secciones importantes
- **h3**: Subsecciones
- **h4**: Títulos de cards
- **p**: Texto de párrafo
- **small**: Texto auxiliar, metadata

## 🎭 Uso de Colores

### Botones

**Primario** (bg-primary)
- Acciones principales: "Crear torneo", "Guardar", "Enviar"
- Call-to-actions importantes
- Uso: Máximo 1-2 por vista

**Secundario** (bg-secondary)
- Acciones secundarias
- Botones de navegación
- Degradados con primary

**Outline** (border-primary)
- Acciones terciarias
- Botones de cancelar/regresar

**Ghost** (hover:bg-accent)
- Acciones sutiles
- Iconos interactivos

### Cards

**Estándar**
```css
bg-card border border-border rounded-xl p-6
```

**Destacadas**
```css
bg-gradient-to-br from-primary to-secondary
```

**Hover**
```css
hover:shadow-lg hover:shadow-primary/10 transition-all
```

### Badges/Tags

**Status**
- En vivo: `bg-red-500/20 text-red-500`
- Próximo: `bg-chart-2/20 text-chart-2`
- Finalizado: `bg-muted text-muted-foreground`

**Información**
- Primary: `bg-primary/20 text-primary`
- Success: `bg-green-500/20 text-green-500`
- Warning: `bg-amber-500/20 text-amber-500`

## 🌈 Gradientes

### Principales

**Hero/Headers**
```css
bg-gradient-to-br from-primary to-secondary
```

**Cards Especiales**
```css
bg-gradient-to-r from-primary via-secondary to-primary
```

**Backgrounds Sutiles**
```css
bg-gradient-to-br from-background via-primary/5 to-background
```

**Texto Gradiente**
```css
bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent
```

## 🎯 Componentes Comunes

### StatCard
```tsx
<div className="bg-card border border-border rounded-xl p-6">
  <div className="bg-primary/10 p-3 rounded-lg">
    <Icon className="h-6 w-6 text-primary" />
  </div>
  <div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
</div>
```

### Button Primary
```tsx
<button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
  Texto del botón
</button>
```

### Input
```tsx
<input className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
```

### Card con Gradiente
```tsx
<div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-white">
  {/* Contenido */}
</div>
```

## 📱 Responsive

### Breakpoints

```css
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeño */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Grid Responsive
```css
grid md:grid-cols-2 lg:grid-cols-3 gap-6
```

## ♿ Accesibilidad

### Contraste de Colores

Todos los colores cumplen con WCAG AA:
- Texto sobre primary: ratio 4.5:1 ✓
- Texto sobre secondary: ratio 4.5:1 ✓
- Texto sobre backgrounds: ratio 7:1 ✓

### Focus States

```css
focus:outline-none focus:ring-2 focus:ring-primary
```

## 🎨 Ejemplos de Uso

### Tabla de Posiciones
- Posición 1-2: `bg-primary text-primary-foreground`
- Posición 3-4: `bg-chart-2/20 text-chart-2`
- Última posición: `bg-destructive/20 text-destructive`

### Partidos
- En vivo: `bg-red-500/10 border-2 border-red-500/30`
- Programado: `bg-chart-2/20`
- Finalizado: `bg-muted`

### Gráficas
- Victorias: `--chart-1` (Azul)
- Empates: `--chart-3` (Ámbar)
- Derrotas: `--destructive` (Rojo)

## 🎭 Animaciones

### Transitions
```css
transition-all duration-300
transition-colors duration-200
transition-transform duration-200
```

### Hover Effects
```css
hover:scale-105 transition-transform
hover:shadow-xl transition-shadow
hover:bg-primary/90 transition-colors
```

### Loading States
```css
animate-pulse
animate-spin
```

## 📦 Iconos

Todos los iconos provienen de **Lucide React**:
- Tamaño estándar: `h-5 w-5`
- Tamaño grande: `h-6 w-6`
- Tamaño extra grande: `h-8 w-8`

Siempre usar con clase de color:
```tsx
<Trophy className="h-6 w-6 text-primary" />
```

---

**Nota**: Este sistema de diseño está basado en Tailwind CSS 4 y utiliza variables CSS para temas dinámicos.
