# Comando: nueva pantalla Ionic

Crea una nueva pantalla completa siguiendo las convenciones del proyecto.

## Instrucciones

1. Crea los archivos en `src/app/pages/$ARGUMENTS/`:
   - `$ARGUMENTS.page.ts`
   - `$ARGUMENTS.page.html`
   - `$ARGUMENTS.page.scss`

2. Reglas obligatorias para el `.ts`:
   - Standalone Component (`standalone: true`)
   - Sin NgModule
   - Estado reactivo con Angular Signals (`signal`, `computed`)
   - Lógica de negocio solo en servicios — el componente solo llama servicios y muestra datos
   - Imports mínimos necesarios de Ionic

3. Reglas obligatorias para el `.html`:
   - Estructura base: `ion-header` + `ion-content`
   - Layout con `IonGrid + IonRow + IonCol` — nunca CSS grid/flex propio
   - Responsivo obligatorio: `size="12" size-md="6" size-lg="4"`
   - Usar clases utilitarias de `utilities.scss` antes de crear estilos nuevos:
     `.ft-card`, `.ft-card-header`, `.ft-gradient-*`, `.ft-number-display`,
     `.ft-label-secondary`, `.ft-progress-bar`, `.ft-page-content`, `.ft-actions-row`

4. Reglas obligatorias para el `.scss`:
   - Máximo 50 líneas
   - NUNCA valores HEX directos — siempre `var(--nombre-variable)`
   - NUNCA CSS propio para colores de fondo o texto — usar variables del tema
   - SIEMPRE variables SCSS en media queries: `@media (min-width: #{$desktop})`

5. Registra la ruta en `app.routes.ts` con lazy loading:
   ```ts
   {
     path: '$ARGUMENTS',
     loadComponent: () => import('./pages/$ARGUMENTS/$ARGUMENTS.page')
       .then(m => m.$ARGUMENTSPage)
   }
   ```

6. Al terminar muestra un resumen de archivos creados/modificados.
