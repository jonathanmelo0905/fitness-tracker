# CLAUDE.md — NutriEval (Frontend)

---

## 0. Instrucciones para la IA (leer siempre primero)

### Comportamiento general
- Antes de escribir código, confirma qué archivo(s) vas a tocar y espera aprobación si son más de 3
- Si una tarea es ambigua, haz una sola pregunta de clarificación antes de proceder
- Al terminar una tarea, indica qué cambió y si hay algo que deba actualizarse en este archivo

### Fase actual: **Fase 5 — Backend + conexión API**
- Solo implementar código relacionado con autenticación JWT y conexión al API
- No implementar código de fases posteriores aunque parezca conveniente
- Al completar un ítem, marcarlo como `[x]` en la sección 8

### Versión de producto actual: **v1.0 MVP**
Funcionalidades del frontend en esta versión:
- Herramientas: calculadora nutricional + evaluación física (ya existe ✅)
- Login entrenador + login cliente
- Panel de clientes del entrenador
- Registro completo de cliente (datos personales, salud, hábitos, PAR-Q, consentimiento)
- Historial de evaluaciones por cliente
- Medidas corporales con gráficas de progreso
- Fotos de evolución (subida a Cloudinary)
- Agenda simple del entrenador
- Vista próxima sesión para el cliente
- Configuración: redes sociales del entrenador

### Identidad de la app
- **Nombre completo:** NutriEval
- **Short name:** NutriEval
- **Versión actual:** 1.1
- **Theme color:** `#1a6b3a`
- **Background color:** `#0f1923`
- **Cloudinary cloud name:** `dnj3zphoj`
- Credenciales sensibles NUNCA en código — solo en variables de entorno `.env`

### Reglas de código (permanentes)
- **NUNCA** valores HEX directamente en `.scss` — siempre `var(--nombre-variable)`
- **NUNCA** NgModule — solo Standalone Components
- **NUNCA** CSS grid/flex propio para layout — usar `IonGrid + IonRow + IonCol`
- **SIEMPRE** variables SCSS en media queries: `@media (min-width: #{$desktop})`
- **SIEMPRE** comentar cada fórmula matemática con fuente bibliográfica
- **SIEMPRE** verificar `utilities.scss` antes de crear estilo nuevo
- Archivos `.scss` de componentes: máximo 50 líneas
- Lógica de negocio solo en servicios — páginas solo llaman servicios y muestran datos
- Estado reactivo con Angular Signals (`signal`, `computed`)
- Datos entre páginas via `NavigationExtras state`
- Llamadas HTTP via servicios dedicados usando `HttpClient`
- JWT guardado en `localStorage` key: `nutrieval-token`
- Commits: Conventional Commits → `feat(modulo): descripción`

---

## 1. Descripción General

**Nombre:** NutriEval
**Propósito:** Plataforma SaaS profesional para entrenadores personales y nutricionistas. Combina CRM de clientes, historia clínica deportiva, seguimiento de progreso, nutrición, rutinas, agenda y analítica.
**Público objetivo:** Entrenadores personales independientes, entrenadores en gimnasios, nutricionistas deportivos.
**Repositorio:** https://github.com/jonathanmelo0905/fitness-tracker
**Versión actual:** 1.1

---

## 2. Stack Tecnológico

### Frontend / App
| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 19.x | Framework principal (Standalone Components + Signals) |
| Ionic | 8.x | Componentes UI móvil |
| TypeScript | 5.x | Lenguaje principal |
| Capacitor | 8.x | Runtime nativo Android |
| SCSS | — | Estilos con variables CSS y sistema de temas |
| jsPDF + jspdf-autotable | Latest | Generación de PDFs en cliente |
| @capacitor/filesystem | Latest | Guardar archivos en Android |
| @capacitor/share | Latest | Compartir archivos nativamente |
| @angular/pwa | Latest | Service worker + manifest ✅ |
| HttpClient | Angular | Llamadas al backend API REST |

### Servicios externos
| Servicio | Uso |
|---|---|
| Cloudinary | Fotos de progreso (cloud: dnj3zphoj) |
| Firebase Hosting | Deploy temporal pruebas PWA ✅ |
| Railway | Producción final frontend + backend |

---

## 3. Arquitectura

### Estructura de carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── fitness-calculator.service.ts    ✅
│   │   │   ├── physical-evaluation.service.ts   ✅
│   │   │   ├── pdf-export.service.ts            ✅
│   │   │   ├── theme.service.ts                 ✅
│   │   │   ├── auth.service.ts                  ← Fase 5
│   │   │   ├── cliente.service.ts               ← Fase 5
│   │   │   ├── evaluacion.service.ts            ← Fase 5
│   │   │   ├── medidas.service.ts               ← Fase 5
│   │   │   ├── fotos.service.ts                 ← Fase 5
│   │   │   └── sesion.service.ts                ← Fase 5
│   │   ├── guards/
│   │   │   ├── auth.guard.ts                    ← Fase 5
│   │   │   └── role.guard.ts                    ← Fase 5
│   │   └── interceptors/
│   │       └── jwt.interceptor.ts               ← Fase 5
│   ├── shared/
│   │   ├── models/
│   │   │   ├── client.model.ts                  ✅
│   │   │   ├── physical-evaluation.model.ts     ✅
│   │   │   ├── cliente.model.ts                 ← Fase 5
│   │   │   ├── evaluacion.model.ts              ← Fase 5
│   │   │   ├── sesion.model.ts                  ← Fase 5
│   │   │   └── auth.model.ts                    ← Fase 5
│   │   └── components/
│   │       ├── pwa-install/                     ✅
│   │       ├── progress-chart/                  ← v2.0
│   │       ├── photo-comparator/                ← v2.0
│   │       └── kpi-card/                        ← v3.0
│   └── pages/
│       ├── home/                                ✅
│       ├── calculator/                          ✅
│       ├── results/                             ✅
│       ├── physical-evaluation/                 ✅
│       ├── physical-evaluation-results/         ✅
│       ├── settings/                            ✅
│       ├── login/                               ← Fase 5
│       ├── dashboard/                           ← Fase 5
│       ├── clientes/                            ← Fase 5
│       ├── cliente-detalle/                     ← Fase 5
│       ├── cliente-registro/                    ← Fase 5
│       ├── agenda/                              ← Fase 5
│       └── cliente-portal/                      ← Fase 5
├── public/
│   └── manifest.webmanifest                     ✅
├── environments/
│   ├── environment.ts                           ← agregar apiUrl Fase 5
│   └── environment.prod.ts
```

### Roles de usuario
| Rol | Acceso |
|---|---|
| `superadmin` | Panel administrativo NutriEval (v4.0) |
| `entrenador` | Dashboard, clientes, herramientas, agenda, configuración |
| `cliente` | Portal: sesiones, progreso, rutina, dieta, check-ins |

### Rutas actuales ✅
```
/                              → redirect a /home
/home                          → HomePage (herramientas)
/calculator                    → CalculatorPage
/results                       → ResultsPage
/physical-evaluation           → PhysicalEvaluationPage
/physical-evaluation-results   → PhysicalEvaluationResultsPage
/settings                      → SettingsPage
```

### Rutas Fase 5
```
/login                         → LoginPage (entrenador + cliente)  ✅
/clientes                      → Tab 1 — ClientesPage (lista + stats, landing del entrenador)
/clientes/nuevo                → ClienteRegistroPage
/clientes/:id                  → ClienteDetallePage
/herramientas                  → Tab 2 — HerramientasPage (calculadora + evaluación física)
/agenda                        → Tab 3 — AgendaPage
/settings                      → Tab 4 — SettingsPage (ya existe, se integra al tab bar)
/portal                        → ClientePortalPage (sin tabs)
```

---

## 4. Lenguaje Visual

### Tema Oscuro (dark-theme — predeterminado)
```css
--bg-primary:     #0f1923
--bg-card:        #1a2535
--bg-panel:       #243040
--bg-border:      #2e3f54
--text-primary:   #ffffff
--text-secondary: #7f8c8d
--input-bg:       #1a2535
--input-border:   #2e3f54
```

### Tema Claro (light-theme)
```css
--bg-primary:     #f4f6f8
--bg-card:        #ffffff
--bg-panel:       #e8ecf0
--bg-border:      #d0d7e0
--text-primary:   #1a1a2e
--text-secondary: #555555
--input-bg:       #ffffff
--input-border:   #d0d7e0
```

### Colores Ionic
```css
--ion-color-primary:   #1a6b3a
--ion-color-secondary: #2ecc71
--ion-color-tertiary:  #5b6abf
--ion-color-warning:   #f0a500
--ion-color-danger:    #e74c3c
--ion-color-medium:    #7f8c8d
```

### Gradientes por módulo
```css
--gradient-nutrition:   linear-gradient(135deg, #c0392b, #e67e22)
--gradient-body:        linear-gradient(135deg, #1a6b3a, #2ecc71)
--gradient-projection:  linear-gradient(135deg, #1a4a8a, #2980b9)
--gradient-macros:      linear-gradient(135deg, #5b3fa0, #8e44ad)
--gradient-refeeds:     linear-gradient(135deg, #0f7b7b, #1abc9c)
--gradient-alerts:      linear-gradient(135deg, #b7770d, #f39c12)
--gradient-fitness:     linear-gradient(135deg, #c0392b, #e67e22)
--gradient-somatotype:  linear-gradient(135deg, #5b3fa0, #8e44ad)
--gradient-dashboard:   linear-gradient(135deg, #1a6b3a, #5b6abf)
--gradient-cliente:     linear-gradient(135deg, #0f6e56, #1D9E75)
```

### Breakpoints SCSS
```scss
$mobile:      767px
$tablet:      1023px
$desktop:     1024px
$max-content: 1200px
```

---

## 5. Servicios y Componentes

| Servicio / Componente | Estado | Descripción |
|---|---|---|
| FitnessCalculatorService | ✅ | IMC, TMB, macros, proyección, refeeds |
| PhysicalEvaluationService | ✅ | Pliegues, somatotipo, 4 componentes |
| PdfExportService | ✅ | PDF nutricional + evaluación física |
| ThemeService | ✅ | Signal + localStorage, dark/light |
| PwaInstallComponent | ✅ | Banner Android + instrucciones iOS |
| AuthService | ⏳ Fase 5 | Login, JWT, roles, logout |
| ClienteService | ⏳ Fase 5 | CRUD clientes via API |
| EvaluacionService | ⏳ Fase 5 | Evaluaciones y medidas via API |
| FotosService | ⏳ Fase 5 | Upload a Cloudinary via API |
| SesionService | ⏳ Fase 5 | Agenda y sesiones via API |

---

## 6. Clases Utilitarias (utilities.scss)

```
.ft-card              → card base
.ft-card-header       → header con gradiente
.ft-gradient-*        → gradientes por módulo
.ft-badge-success/warning/danger
.ft-number-display    → número grande de resultado
.ft-label-secondary   → etiqueta secundaria
.ft-progress-bar      → barra de progreso
.ft-page-content      → contenedor max-width centrado
.ft-actions-row       → fila de botones responsiva
```

---

## 7. Fórmulas Implementadas

```
IMC = peso / estatura²
TMB Masculino = (10×peso) + (6.25×estatura_cm) - (5×edad) + 5   [Mifflin-St Jeor]
TMB Femenino  = (10×peso) + (6.25×estatura_cm) - (5×edad) - 161 [Mifflin-St Jeor]
Jackson & Pollock 3 y 7 pliegues — Siri (DC→%G)
Durnin & Womersley 4 pliegues
Yuhasz Hombre: %G = (suma6 × 0.097) + 3.64
Yuhasz Mujer:  %G = (suma6 × 0.1429) + 4.56
Peso óseo (Rocha): 3.02 × (h² × dHumero × dFemur × 400)^0.712
Peso residual H: peso × 0.241 / M: peso × 0.209  [Wurch]
ICC = cintura / cadera
ICE = cintura / estatura_cm
Ruffier: I = ((FC_post-70) + (FC_rec-FC_rep)) / 10
1RM Epley: peso × (1 + reps/30)
Somatotipo Heath-Carter
```

---

## 8. Roadmap de Producto

### ✅ v1.0 — Completado hasta Fase 4
- Herramientas (calculadora + evaluación + PDF)
- PWA instalable + Firebase Hosting

### 🔄 Fase 5 — Backend + API (actual)
- [ ] Crear proyecto ASP.NET Core Web API (.NET 8)
- [ ] Configurar PostgreSQL en Railway
- [ ] Implementar ASP.NET Identity + JWT
- [ ] Roles: entrenador, cliente, superadmin
- [ ] Endpoints: auth, clientes, evaluaciones, medidas, fotos, sesiones
- [ ] Integrar Cloudinary SDK en backend
- [x] Agregar `apiUrl` en `environment.ts`
- [x] Crear `jwt.interceptor.ts`
- [x] Crear `auth.guard.ts` y `role.guard.ts`
- [x] Pantalla Login (entrenador + cliente)
- [ ] Tab bar del entrenador (4 tabs: clientes, herramientas, agenda, settings)
- [ ] Tab 1 /clientes — lista de clientes con stats
- [ ] Registro completo de cliente (/clientes/nuevo) — incluye campo `passwordTemporal` + modal de un solo uso post-creación (ver §13)
- [ ] Detalle de cliente con evaluaciones, medidas y fotos (/clientes/:id)
- [ ] Tab 2 /herramientas — mover calculadora + evaluación física
- [ ] Tab 3 /agenda — sesiones del entrenador
- [ ] Tab 4 /settings — ya existe, integrar al tab bar
- [ ] Vista próxima sesión para el cliente (/portal)
- [ ] Deploy v1.0 en Railway
- [ ] `/update-claude-md` al terminar

### ⏳ v2.0 — Seguimiento completo (+3–4 meses)
- Constructor de rutinas drag & drop
- Biblioteca de ejercicios con video
- Historial de cargas y PRs
- Plan nutricional + registro diario (Open Food Facts API)
- Portal cliente completo
- Check-ins semanales

### ⏳ v3.0 — Automatización (+3–4 meses)
- Calendario sesiones + recordatorios push
- Pagos: Stripe + Mercado Pago
- Dashboard KPIs analítico
- Gamificación: logros, streaks, badges
- Alertas automáticas de estancamiento

### ⏳ v4.0 — SaaS multi-entrenador (+4–6 meses)
- Registro público + suscripciones SaaS
- Prueba gratis 14 días
- Panel superadmin
- White-label: dominio + colores propios
- Integraciones: Apple Health, Google Fit, WhatsApp Business

---

## 9. Deuda Técnica

- [ ] Eliminar carpeta stub `src/app/home/`
- [ ] Cambiar `appId` en `capacitor.config.ts` (actualmente `io.ionic.starter`)
- [ ] Tests unitarios para `FitnessCalculatorService` y `PhysicalEvaluationService`
- [ ] SCSS budget exceeded en 4 páginas
- [ ] CommonJS warning en `canvg` (dependencia jsPDF)

---

## 10. Decisiones Abiertas

- [ ] Nombre definitivo para tiendas/dominio
- [ ] Dominio web personalizado
- [ ] Modelo de precios SaaS (v4.0)
- [ ] Publicación en Google Play Store
- [ ] Mac en la nube para compilar iOS
- [x] Autenticación de clientes v1.0 → contraseña temporal asignada por entrenador (ver §13)
- [ ] Cambio de contraseña por parte del cliente → v2.0

---

## 11. Flujo de Navegación

### v1.0 MVP

```
/login  ──────────────────────────────────────────────────────────
         │
         ├── Entrenador → Tab Bar (ion-tabs)
         │     ├── Tab 1  /clientes          Lista de clientes + stats del entrenador
         │     │           ├── /clientes/nuevo       Registro completo de cliente
         │     │           └── /clientes/:id         Detalle: evaluaciones, medidas, fotos
         │     ├── Tab 2  /herramientas      Calculadora nutricional + evaluación física
         │     ├── Tab 3  /agenda            Sesiones del entrenador
         │     └── Tab 4  /settings          Redes sociales + toggle de tema
         │
         └── Cliente → Sin tabs
               └── /portal                  Próxima sesión del cliente
```

### v2.0 — Seguimiento completo

```
Tab Bar entrenador (sin cambios de estructura)
  /clientes/:id  agrega:  Rutinas, Plan nutricional, Check-ins semanales
  /herramientas  agrega:  Biblioteca de ejercicios, Registro diario de comidas

/portal cliente se expande:
  Mi rutina · Mi plan · Check-in semanal · Mi progreso (gráficas)
```

### v3.0 — Automatización

```
Tab Bar entrenador agrega Tab 5:
  /pagos                  Gestión de pagos (Stripe + Mercado Pago)

/clientes/:id  agrega:   Alertas automáticas de estancamiento
/portal        agrega:   Mis pagos
```

### v4.0 — SaaS multi-entrenador

```
/registro               Onboarding de entrenador nuevo (prueba 14 días)
/superadmin             Panel administrativo NutriEval
Subdominio por entrenador  → white-label (dominio + colores propios)
```

---

## 12. Especificaciones de Pantalla

### Tab 1 — /clientes · Sistema de Onboarding de Clientes

> Se implementa en Fase 5, en la pantalla `/clientes/:id`.

#### Checklist de onboarding (sugerido, no obligatorio)

| # | Paso | Campo backend | Obligatorio al crear |
|---|---|---|---|
| 1 | Datos básicos | `nombre`, `apellido`, `email`, `fecha_nacimiento`, `sexo` | ✅ Sí |
| 2 | Medidas iniciales | `peso_inicial`, `altura` | No |
| 3 | Fotos iniciales | `fotos_iniciales` (Cloudinary) | No |
| 4 | Evaluación nutricional o física | evaluación creada en `/clientes/:id/evaluaciones` | No |
| 5 | Primera sesión agendada | sesión creada en `/agenda` | No |
| 6 | PAR-Q completado | `parq_completado: boolean` | No |
| 7 | Consentimiento firmado | `consentimiento_aceptado: boolean` | No |

**Porcentaje de completado:** se calcula en el frontend contando cuántos campos del objeto `Cliente` devuelto por el backend están presentes/verdaderos. No requiere endpoint adicional.

```typescript
// Ejemplo de cálculo (ClienteDetallePage o ClienteService)
function calcularOnboarding(c: Cliente): { completados: number; total: number } {
  const pasos = [
    !!(c.nombre && c.apellido && c.email),   // datos básicos
    !!(c.peso_inicial && c.altura),           // medidas
    !!(c.fotos_iniciales?.length),            // fotos
    !!(c.evaluaciones?.length),               // evaluación
    !!(c.sesiones?.length),                   // sesión agendada
    !!c.parq_completado,                      // PAR-Q
    !!c.consentimiento_aceptado,              // consentimiento
  ];
  return { completados: pasos.filter(Boolean).length, total: pasos.length };
}
```

#### Reglas de UX (no negociables)

- **Lista /clientes:** badge sutil en la tarjeta del cliente mostrando pasos pendientes (ej. `3/7`). Solo visible si hay pasos sin completar. No usar color rojo — usar `--text-muted` o `--ion-color-warning`.
- **Detalle /clientes/:id:** banner no invasivo en la parte superior con los pasos faltantes y acceso directo a cada uno. Colapsa cuando el onboarding está completo.
- **Sin modales bloqueantes:** el entrenador puede navegar y usar todas las funciones del cliente aunque el onboarding esté incompleto.
- **Sin notificaciones push:** el recordatorio es solo visual dentro de la pantalla, nunca una notificación del sistema.
- **Sin impedir avanzar:** crear un cliente solo requiere datos básicos (paso 1). El resto es opcional y se completa en `/clientes/:id`.

---

## 13. Decisiones Técnicas — v1.0

### Autenticación de clientes — contraseña temporal

**Flujo decidido para v1.0:**

1. En `/clientes/nuevo` (paso 1 — Datos personales), el entrenador puede asignar una contraseña temporal al cliente (campo opcional en el formulario).
2. Al hacer clic en "Crear cliente" y recibir la respuesta exitosa del backend, el sistema muestra un **modal de un solo uso** con la contraseña temporal en texto claro para que el entrenador la copie y la comparta manualmente (WhatsApp, mensaje, email, etc.).
3. El modal **no se puede volver a abrir** — la contraseña no se vuelve a mostrar. El entrenador es responsable de anotarla o compartirla en ese momento.
4. El cliente puede iniciar sesión en `/login` con su email y esa contraseña temporal desde el primer día.
5. El cambio de contraseña por parte del cliente se implementa en **v2.0**.

**Reglas de implementación:**

- El campo `passwordTemporal` en el formulario es **opcional**. Si el entrenador lo deja vacío, el cliente simplemente no tendrá acceso al portal hasta que se le asigne una contraseña (funcionalidad v2.0).
- La contraseña temporal se envía en texto plano al backend dentro del cuerpo del POST. El transporte es seguro (HTTPS). **NUNCA almacenar en localStorage ni en ningún estado persistente del frontend.**
- El frontend **descarta la contraseña** en cuanto el modal se cierra — solo existe en memoria mientras el modal está abierto.
- Si el campo viene vacío, no incluirlo en el payload (`...(v1.passwordTemporal && { passwordTemporal: v1.passwordTemporal })`).

**Contrato de API — POST /api/clientes:**

```json
// Request body (campo adicional respecto a ClienteCreate)
{
  "nombre": "Ana",
  "apellido": "Morales",
  "email": "ana@email.com",
  "fechaNacimiento": "1995-03-15",
  "genero": "Femenino",
  "nivelActividad": "moderado",
  "parqAprobado": false,
  "consentimientoFirmado": false,
  "passwordTemporal": "Nutri2025!"   // ← opcional; backend hashea con BCrypt y guarda en password_hash
}
```

**Backend (ASP.NET Core):**
- Si `passwordTemporal` viene en el body, hashearlo con BCrypt y guardarlo en la columna `password_hash` del cliente.
- Si no viene, dejar `password_hash` en `null` — el cliente no podrá hacer login hasta que se le asigne una en v2.0.
- El campo `passwordTemporal` **nunca** se devuelve en la respuesta del endpoint.

**Modelo TypeScript a actualizar (`ClienteCreate`):**

```typescript
export type ClienteCreate = Omit<Cliente, 'id' | 'entrenadorId' | 'creadoEn' | 'activo'> & {
  passwordTemporal?: string;
};
```

**UX del modal post-creación:**
- Título: "Cliente creado — comparte el acceso"
- Mostrar email del cliente + contraseña temporal en texto claro dentro de un bloque copiable.
- Botón "Copiar contraseña" (usa `navigator.clipboard`).
- Botón "Entendido, ya la compartí" → cierra el modal y navega a `/clientes/:id`.
- Advertencia visible: "Esta contraseña no se volverá a mostrar."
- Si no se asignó contraseña temporal, el modal solo muestra confirmación de creación sin datos de acceso.
