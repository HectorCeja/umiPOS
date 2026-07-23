# Low-Fidelity Wireframes

## Acceso y onboarding

```text
┌ Login ───────────────┐   ┌ Onboarding 2/4 ────────────┐
│ Correo               │   │ País   Moneda  Zona horaria│
│ Contraseña [mostrar] │   │ Tipo de negocio            │
│ [Entrar]             │   │ [Atrás]          [Continuar]│
│ Recuperar acceso     │   └─────────────────────────────┘
└──────────────────────┘
```

## Shell administrativo y contexto

```text
┌ Sidebar ┬ Org Alpha ▾ · Centro ▾ ─── Ayuda · Perfil ┐
│ Inicio  │ Breadcrumb / Título          [Acción]      │
│ Ventas  │ Filtros / métricas / estado                │
│ Producto│ Lista o cards → Detail panel               │
│ Invent. │                                           │
│ Equipo  │                                           │
└─────────┴───────────────────────────────────────────┘
Selector contextual: Organización → Sucursal → confirmar si hay trabajo pendiente
```

Products list/editor, Organization/Branch settings, Members/Invitations e Integrations reutilizan PageHeader + FilterBar + EntityList/FormSection. El editor divide Identidad, variantes, precio, media y estado; Integrations muestra estado/mappings, no simula conexión UMI.

## Inventario

```text
Overview: [Location] [Search]  On hand | Reserved | Available
Adjustment: Variant → Location → Quantity → Reason → Review → Confirm
Transfer: Origin → Destination → Lines → Review → Create
Count: Scope → Capture → Differences → Approval
```

## Sales history/detail/refund

```text
History [date][branch][status] → folio/status/total
Detail: immutable snapshot | payments | timeline | receipt
Refund: lines + quantity → destination (available/damaged/quarantine) → reason → approval
```

## POS adaptive

```text
Desktop/landscape                  Portrait/mobile limited
┌ Context + online ────────────┐   ┌ Search/scan ─────────┐
├ Search/Categories ┬ Cart ────┤   │ Categories / products│
│ Product grid      │ lines    │   ├──────────────────────┤
│                   │ totals   │   │ Total  [Ver carrito] │
│                   │ [Cobrar] │   └──────────────────────┘
└───────────────────┴──────────┘   BottomSheet: cart → checkout
```

Checkout: authoritative summary → payment method. Mixed payment: allocations + remaining balance → confirm. Suspended sales: cards by folio/time/actor → recover. Receipt: organization/branch snapshot, lines, taxes, payments and integrations.

## UMI and Flutter future

```text
UMI shell → signed context/deep link → NEXO origin banner + capability → safe return
Flutter: NavigationBar (compact) ⇄ NavigationRail (wide); restore route/context/state
```
