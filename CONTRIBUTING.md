# Guía de Contribución - Foot-B

## Agregar una Nueva Página

1. Crear el archivo en `src/app/pages/NombrePagina.tsx`
2. Importar y usar `DashboardLayout` si es una página del dashboard
3. Agregar la ruta en `src/app/App.tsx`

Ejemplo:
```tsx
import DashboardLayout from '../components/layout/DashboardLayout';

export default function MiNuevaPagina() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Mi Nueva Página</h1>
      </div>
    </DashboardLayout>
  );
}
```

## Agregar Datos Mock

Agregar nuevos datos en `src/app/data/mockData.ts`:

```typescript
export interface MiNuevoTipo {
  id: string;
  // otros campos...
}

export const mockMisDatos: MiNuevoTipo[] = [
  // datos de ejemplo...
];
```

## Crear Componentes Reutilizables

Los componentes UI reutilizables van en `src/app/components/ui/`:

```tsx
interface MiComponenteProps {
  title: string;
  // otros props...
}

export default function MiComponente({ title }: MiComponenteProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3>{title}</h3>
    </div>
  );
}
```

## Estilos y Temas

### Variables CSS Disponibles

En `src/styles/theme.css` hay variables para:
- Colores: `--primary`, `--secondary`, `--accent`
- Espaciado: `--radius-sm`, `--radius-md`, `--radius-lg`
- Tipografía: `--font-weight-medium`, `--font-weight-normal`

### Clases de Tailwind

Usar las clases semánticas:
- `bg-primary` - Color principal verde
- `text-primary` - Texto verde
- `bg-card` - Fondo de cards
- `border-border` - Bordes
- `text-muted-foreground` - Texto secundario

## Agregar una Nueva Estadística

1. Definir la interfaz en `mockData.ts`
2. Agregar datos de ejemplo
3. Crear visualización con `recharts` o componentes custom
4. Usar `StatCard` o `StatsChart` para mostrar

## Agregar un Nuevo Formato de Torneo

1. Agregar el formato en `utils/constants.ts`
2. Actualizar `TOURNAMENT_FORMATS` y `TOURNAMENT_FORMATS_LABELS`
3. Crear lógica para generación de calendario
4. Agregar visualización específica si es necesario

## Estructura de Archivos Recomendada

```
src/app/
├── components/
│   ├── layout/           # Layouts generales
│   ├── ui/              # Componentes reutilizables
│   └── features/        # Componentes específicos de features
├── pages/               # Páginas de la aplicación
├── data/                # Datos mock y tipos
├── utils/               # Utilidades y helpers
└── hooks/               # Custom hooks (si necesario)
```

## Mejores Prácticas

### Componentes
- Un componente por archivo
- Props con TypeScript interfaces
- Nombres descriptivos en PascalCase
- Exportar como default

### Estilos
- Preferir Tailwind sobre CSS custom
- Usar variables CSS del tema
- Mantener consistencia con el design system

### Datos
- Siempre tipar con TypeScript
- Usar datos mock realistas
- Mantener consistencia con IDs

### Rutas
- URLs descriptivas y semánticas
- Usar parámetros para IDs: `/tournaments/:id`
- Mantener estructura lógica

## Testing (Futuro)

Cuando se agreguen tests:
- Unit tests para utilidades
- Component tests para UI
- Integration tests para flujos completos

## Integración con Backend

Para conectar con Supabase:
1. Configurar variables de entorno
2. Crear servicios en `src/app/services/`
3. Reemplazar datos mock con llamadas a API
4. Agregar manejo de errores
5. Implementar loading states

## Iconos

Usar `lucide-react` para todos los iconos:
```tsx
import { Trophy, Calendar, Users } from 'lucide-react';
```

## Animaciones

Usar `motion/react` para animaciones:
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Contenido
</motion.div>
```

## Notificaciones

Usar `sonner` para toasts:
```tsx
import { toast } from 'sonner';

toast.success('Operación exitosa');
toast.error('Error al procesar');
```

## Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [React Router Docs](https://reactrouter.com/)
- [Recharts Examples](https://recharts.org/)
