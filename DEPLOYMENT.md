# Guía de Despliegue - Foot-B

## Requisitos Previos

- Node.js 18+ instalado
- pnpm instalado globalmente
- Cuenta en Vercel (recomendado) o Netlify

## Configuración Local

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Modo desarrollo:**
   El servidor de desarrollo ya está corriendo en el ambiente de Make.
   Para desarrollo local tradicional:
   ```bash
   pnpm run dev
   ```

3. **Variables de entorno (futuro):**
   Crear un archivo `.env.local`:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

## Despliegue en Vercel

### Opción 1: Despliegue desde Git

1. **Conectar repositorio:**
   - Ir a [vercel.com](https://vercel.com)
   - Click en "New Project"
   - Importar tu repositorio de Git

2. **Configurar proyecto:**
   - Framework Preset: Vite
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Variables de entorno:**
   Agregar en la configuración del proyecto:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Click en "Deploy"
   - Vercel construirá y desplegará automáticamente

### Opción 2: CLI de Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

## Despliegue en Netlify

1. **Conectar repositorio:**
   - Ir a [netlify.com](https://netlify.com)
   - Click en "New site from Git"
   - Seleccionar repositorio

2. **Configurar build:**
   - Build command: `pnpm run build`
   - Publish directory: `dist`

3. **Agregar archivo `netlify.toml`:**
   ```toml
   [build]
     command = "pnpm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Deploy:**
   - Click en "Deploy site"

## Optimizaciones Pre-Despliegue

### 1. Optimización de Imágenes
- Comprimir logos y assets
- Usar formatos modernos (WebP, AVIF)
- Implementar lazy loading

### 2. Code Splitting
Ya implementado con React Router.

### 3. Caché de Assets
Configurado automáticamente por Vite.

### 4. Análisis de Bundle
```bash
pnpm run build
# Revisar el tamaño en la salida del build
```

## Configuración de Dominio Personalizado

### En Vercel:
1. Ir a Project Settings → Domains
2. Agregar tu dominio
3. Configurar DNS según instrucciones

### En Netlify:
1. Ir a Domain settings
2. Add custom domain
3. Configurar DNS

## Integración con Supabase

Cuando conectes Supabase:

1. **Crear proyecto en Supabase:**
   - Ir a [supabase.com](https://supabase.com)
   - Crear nuevo proyecto

2. **Obtener credenciales:**
   - API URL
   - Anon Key

3. **Configurar variables de entorno:**
   En Vercel/Netlify agregar:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

4. **Actualizar código:**
   Reemplazar imports de `mockData` con llamadas a Supabase

## Monitoreo y Analytics

### Recomendado:
- **Vercel Analytics** - Incluido gratis
- **Google Analytics** - Agregar script en `index.html`
- **Sentry** - Para error tracking
- **Plausible** - Analytics privacy-friendly

## Performance

### Métricas objetivo:
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

### Herramientas:
- Lighthouse (Chrome DevTools)
- WebPageTest
- GTmetrix

## CI/CD

### GitHub Actions ejemplo:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Checklist Pre-Despliegue

- [ ] Tests pasando (cuando se implementen)
- [ ] Build exitoso sin warnings
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado
- [ ] Analytics configurado
- [ ] Error tracking configurado
- [ ] Performance optimizado
- [ ] SEO configurado (meta tags)
- [ ] PWA configurado (si aplica)
- [ ] README actualizado

## Solución de Problemas Comunes

### Build falla:
```bash
# Limpiar cache y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Rutas no funcionan:
Asegurar que el servidor está configurado para SPA:
- Vercel: Automático
- Netlify: Usar `netlify.toml` con redirects

### Estilos no cargan:
Verificar que `postcss.config.mjs` y `vite.config.ts` están incluidos en el repo.

## Mantenimiento Post-Despliegue

1. **Monitorear errores** en Sentry o similar
2. **Revisar analytics** semanalmente
3. **Actualizar dependencias** mensualmente
4. **Backup de base de datos** (Supabase lo hace automático)
5. **Revisar performance** mensualmente con Lighthouse

## Contacto y Soporte

Para issues o preguntas sobre el despliegue, abrir un issue en el repositorio de GitHub.
