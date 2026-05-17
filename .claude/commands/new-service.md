# Comando: nuevo servicio

Crea un nuevo servicio en `src/app/core/services/`.

## Instrucciones

1. Crea el archivo `src/app/core/services/$ARGUMENTS.service.ts`

2. Reglas obligatorias:
   - Decorador `@Injectable({ providedIn: 'root' })`
   - Sin NgModule
   - Estado reactivo con Angular Signals si el servicio mantiene estado
   - Toda la lógica de negocio va aquí — nunca en los componentes/páginas
   - Cada fórmula matemática debe tener comentario con fuente bibliográfica
   - Métodos con tipos de retorno explícitos en TypeScript

3. Estructura base:
   ```ts
   import { Injectable, signal, computed } from '@angular/core';

   @Injectable({ providedIn: 'root' })
   export class $ARGUMENTSService {
     // estado con signals si aplica
     // métodos de negocio
   }
   ```

4. Al terminar muestra cómo inyectarlo en una página:
   ```ts
   private $argumentsService = inject($ARGUMENTSService);
   ```
