# Comando: nuevo componente compartido

Crea un componente reutilizable en `src/app/shared/components/`.

## Instrucciones

1. Crea los archivos en `src/app/shared/components/$ARGUMENTS/`:
   - `$ARGUMENTS.component.ts`
   - `$ARGUMENTS.component.html`
   - `$ARGUMENTS.component.scss`

2. Reglas obligatorias para el `.ts`:
   - Standalone Component (`standalone: true`)
   - Sin NgModule
   - Inputs/Outputs tipados con TypeScript estricto
   - Estado interno con Angular Signals si aplica
   - Sin lógica de negocio — solo presentación y eventos

3. Reglas obligatorias para el `.html`:
   - Componente autocontenido, sin dependencia de estructura de página
   - Usar clases utilitarias de `utilities.scss` cuando apliquen
   - Responsivo si el componente lo requiere

4. Reglas obligatorias para el `.scss`:
   - Máximo 50 líneas
   - NUNCA valores HEX directos — siempre `var(--nombre-variable)`
   - El componente debe verse bien en dark-theme y light-theme sin cambios adicionales

5. Al terminar muestra cómo importarlo en una página:
   ```ts
   import { $ARGUMENTSComponent } from '../shared/components/$ARGUMENTS/$ARGUMENTS.component';
   ```
