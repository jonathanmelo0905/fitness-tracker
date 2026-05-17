# CLAUDE.md — NutriEval

---

## 0. Instrucciones para la IA (leer siempre primero)

### Comportamiento general
- Antes de escribir código, confirma qué archivo(s) vas a tocar y espera aprobación si son más de 3
- Si una tarea es ambigua, haz una sola pregunta de clarificación antes de proceder
- Al terminar una tarea, indica qué cambió y si hay algo que deba actualizarse en este archivo

### Fase actual: **Fase 4 — PWA**
- Solo implementar código relacionado con PWA, manifest, service worker y Firebase Hosting
- No implementar código de Fase 5 (Backend) ni posteriores aunque parezca conveniente
- Al completar un ítem de la Fase 4, marcarlo como `[x]` en la sección 8

### Identidad de la app
- **Nombre completo:** NutriEval
- **Short name:** NutriEval
- **Versión actual:** 1.1
- **Theme color:** `#1a6b3a`
- **Background color:** `#0f1923`
- El nombre viene de `environment.ts` → `environment.appName` para usarlo en componentes
- En `manifest.webmanifest` e `index.html` va hardcodeado (son archivos estáticos)

### Reglas de código (permanentes — no cambian entre fases)
- **NUNCA** valores HEX directamente en `.scss` de componentes — siempre `var(--nombre-variable)`
- **NUNCA** NgModule — solo Standalone Components
- **NUNCA** CSS grid/flex propio para layout — usar `IonGrid + IonRow + IonCol`
- **SIEMPRE** variables SCSS en media queries: `@media (min-width: #{$desktop})`
- **SIEMPRE** comentar cada fórmula matemática con su fuente bibliográfica
- **SIEMPRE** verificar si existe clase en `utilities.scss` antes de crear estilo nuevo
- Archivos `.scss` de componentes: máximo 50 líneas
- Lógica de negocio solo en servicios — las páginas solo llaman servicios y muestran datos
- Estado reactivo con Angular Signals (`signal`, `computed`) — no con BehaviorSubject
- Datos entre páginas via `NavigationExtras state`
- Commits en formato Conventional Commits: `feat(modulo): descripción`

---

## 1. Descripción General

**Nombre:** NutriEval
**Propósito:** Plataforma digital profesional para entrenadores personales y nutricionistas que digitaliza el proceso completo de evaluación física, cálculo nutricional y seguimiento de clientes.
**Público objetivo:** Entrenadores personales independientes, entrenadores en gimnasios, nutricionistas deportivos y estudiantes avanzados de nutrición.
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
| @angular/pwa | Latest | Service worker + manifest (Fase 4) |
| Firebase Hosting | — | Despliegue web (Fase 4) |

### Backend (Fase 5 — pendiente)
| Tecnología | Uso |
|---|---|
| ASP.NET Core Web API (.NET 8) | API REST |
| Entity Framework Core 8 | ORM |
| SQL Server / PostgreSQL | Base de datos |
| ASP.NET Identity + JWT | Autenticación |

### Infraestructura
| Servicio | Uso |
|---|---|
| Firebase Hosting | Despliegue del frontend web |
| Azure App Service | Backend .NET (Fase 5) |
| Azure SQL / Supabase | Base de datos (Fase 5) |
| Azure Blob Storage | PDFs y fotos de clientes (Fase 5) |

---

## 3. Arquitectura

### Estructura de carpetas

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── fitness-calculator.service.ts
│   │       ├── physical-evaluation.service.ts
│   │       ├── pdf-export.service.ts
│   │       └── theme.service.ts
│   ├── shared/
│   │   ├── models/
│   │   │   ├── client.model.ts
│   │   │   └── physical-evaluation.model.ts
│   │   └── components/
│   │       └── pwa-install/                   ← Fase 4
│   │           ├── pwa-install.component.ts
│   │           ├── pwa-install.component.html
│   │           └── pwa-install.component.scss
│   └── pages/
│       ├── home/
│       ├── calculator/
│       ├── results/
│       ├── physical-evaluation/
│       ├── physical-evaluation-results/
│       └── settings/
├── assets/
│   ├── icon/
│   │   ├── favicon.png
│   │   └── icons/                             ← íconos PWA Fase 4
│   └── shapes.svg
├── environments/
│   ├── environment.ts                         ← appName, appVersion aquí
│   └── environment.prod.ts
├── theme/
│   ├── variables.scss
│   └── utilities.scss
├── global.scss
├── index.html
├── main.ts
├── manifest.webmanifest                       ← generado en Fase 4
└── ngsw-config.json                          ← generado en Fase 4
```

### Patrones usados
- **Standalone Components** sin NgModule
- **Angular Signals** para estado reactivo (`signal`, `computed`)
- **Service layer** — toda la lógica de negocio en servicios
- **CSS Variables** para theming — nunca valores hardcodeados en componentes
- **NavigationExtras (state)** para pasar datos entre páginas

### Rutas definidas
```
/                              → HomePage
/calculator                    → CalculatorPage
/results                       → ResultsPage
/physical-evaluation           → PhysicalEvaluationPage
/physical-evaluation-results   → PhysicalEvaluationResultsPage
/settings                      → SettingsPage
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
```

### Colores fijos de componentes corporales
```css
/* No usan variables — funcionan en ambos temas */
Grasa:    #e74c3c
Muscular: #2ecc71
Óseo:     #3498db
Residual: #9b59b6
```

### Tipografía y espaciado
- Fuente: sistema nativo (`var(--ion-font-family)`)
- Tamaños: Display 48px / H1 28px / H2 22px / Body 16px / Small 14px / Caption 12px
- `--space-xs: 4px` → `--space-2xl: 48px` (7 pasos)

### Breakpoints SCSS
```scss
$mobile:      767px
$tablet:      1023px
$desktop:     1024px
$max-content: 1200px
```

---

## 5. Servicios — Estado de implementación

| Servicio | Estado | Descripción |
|---|---|---|
| FitnessCalculatorService | ✅ Completo | IMC, TMB, macros, proyección, refeeds, alertas |
| PhysicalEvaluationService | ✅ Completo | Pliegues, perímetros, somatotipo, 4 componentes, tests |
| PdfExportService | ✅ Completo | PDF nutricional (7 secc.) + PDF evaluación (9 secc.) |
| ThemeService | ✅ Completo | Signal + localStorage, clases dark/light en body |

---

## 6. Clases Utilitarias (utilities.scss)

```
.ft-card              → card base con bg-card, border-radius, shadow
.ft-card-header       → header de card con gradiente
.ft-gradient-*        → gradientes por módulo
.ft-badge-success/warning/danger → badges de estado
.ft-number-display    → número grande de resultado
.ft-label-secondary   → etiqueta secundaria
.ft-progress-bar      → barra de progreso base
.ft-page-content      → contenedor con max-width centrado
.ft-actions-row       → fila de botones responsiva
```

---

## 7. Fórmulas Implementadas

### Calculadora Nutricional
```
IMC = peso / estatura²
TMB Masculino = (10×peso) + (6.25×estatura_cm) - (5×edad) + 5   [Mifflin-St Jeor]
TMB Femenino  = (10×peso) + (6.25×estatura_cm) - (5×edad) - 161 [Mifflin-St Jeor]
Mantenimiento = TMB × multiplicador actividad
Calorías ajustadas = mantenimiento × (1 + ajuste calórico)
Pérdida semanal = déficit semanal / 6724 kcal/kg
```

### Evaluación Física
```
Jackson & Pollock 3 y 7 pliegues — Siri (DC→%G)
Durnin & Womersley 4 pliegues — tabla constantes A/B
Yuhasz Hombre: %G = (suma6 × 0.097) + 3.64
Yuhasz Mujer:  %G = (suma6 × 0.1429) + 4.56
Peso óseo (Rocha): 3.02 × (h² × dHumero × dFemur × 400)^0.712
Peso residual Hombre: peso × 0.241  [Wurch]
Peso residual Mujer:  peso × 0.209  [Wurch]
Peso muscular = peso - grasa - óseo - residual
ICC = cintura / cadera
ICE = cintura / estatura_cm
Ruffier: I = ((FC_post-70) + (FC_rec-FC_rep)) / 10
1RM Epley: peso × (1 + reps/30)
Somatotipo Heath-Carter
```

---

## 8. Roadmap y Pendientes

### ✅ Completado
- Fases 1–3: Calculadora nutricional, Evaluación física, Resultados con PDF

### 🔄 Fase 4 — PWA (actual)
- [ ] `ng add @angular/pwa --project app`
- [ ] Actualizar `environment.ts` y `environment.prod.ts` con `appName` y `appVersion`
- [ ] Personalizar `manifest.webmanifest` con identidad NutriEval
- [ ] Personalizar `ngsw-config.json` para cache offline
- [ ] Actualizar `src/index.html` con metas correctas (título, description, iOS)
- [ ] Generar íconos PWA en todos los tamaños (72–512px) + apple-touch-icon 180px
- [ ] Crear `PwaInstallComponent` — banner Android + instrucciones iOS
- [ ] Integrar `PwaInstallComponent` en `HomePage`
- [ ] Instalar Firebase CLI y correr `firebase init hosting`
- [ ] Configurar `firebase.json` para servir `www/` con Angular routing
- [ ] Agregar script `deploy` en `package.json`
- [ ] Primer deploy a Firebase Hosting
- [ ] `/update-claude-md` al terminar

### ⏳ Fase 5 — Backend
- [ ] ASP.NET Core Web API + JWT
- [ ] Decidir SQL Server vs PostgreSQL
- [ ] Estrategia refresh tokens
- [ ] CORS — dominios permitidos
- [ ] URL base de la API en `environment.ts`

### ⏳ Fase 6 — Gestión de clientes
- [ ] Persistencia local (Capacitor Preferences o IndexedDB)
- [ ] Historial de clientes
- [ ] Navegación persistente (tab bar o menú lateral)

### ⏳ Fases 7–9
- Fase 7: Planes de alimentación + banco de alimentos
- Fase 8: Vista del cliente + notificaciones push
- Fase 9: Plataforma SaaS multi-entrenador

### 🔴 Deuda técnica (resolver antes de publicar)
- [ ] Eliminar carpeta stub `src/app/home/`
- [ ] Cambiar `appId` en `capacitor.config.ts` (actualmente `io.ionic.starter`)
- [ ] Tests unitarios para `FitnessCalculatorService` y `PhysicalEvaluationService`

---

## 9. Decisiones Abiertas

- [ ] Nombre definitivo para tiendas/dominio (actual: NutriEval — confirmar antes de publicar)
- [ ] Dominio web personalizado
- [ ] Modelo de precios para la plataforma SaaS (Fase 9)
- [ ] Publicación en Google Play Store
- [ ] Mac en la nube para compilar iOS
- [ ] Elegir entre SQL Server y PostgreSQL (Fase 5)
