# Zakat Business — Calculateur de Zakat pour entreprises

> SaaS francophone de calcul de Zakat professionnelle, conforme aux normes AAOIFI.

---

## Présentation

**Zakat Business** est une application web SaaS destinée aux dirigeants d'entreprises musulmans en France et dans la francophonie. Elle résout l'absence d'outil professionnel pour calculer la Zakat sur les actifs d'entreprise selon la méthode du **capital circulant net (Net Working Capital)**, conformément aux normes de l'AAOIFI (*Accounting and Auditing Organization for Islamic Financial Institutions*).

La plupart des ressources disponibles se limitent à des calculateurs personnels ou des feuilles Excel artisanales, inadaptés à la comptabilité d'entreprise. Zakat Business propose une expérience guidée, pédagogique, et sauvegardée, avec émission de certificats PDF officiels pour les abonnés Pro.

---

## Fonctionnalités

### Calcul
- Formulaire multi-étapes (4 étapes) avec navigation animée
- Saisie des actifs zakatable : trésorerie, stocks, créances clients
- Saisie des dettes déductibles : fournisseurs, fiscales, salariales
- Cours de l'or récupéré en temps réel (API externe)
- Calcul automatique du seuil du Nisab (85g × cours du jour)
- Taux Zakat AAOIFI : **2,5775 %** sur l'actif net zakatable
- Support multi-devises : EUR, USD, GBP, MAD, TND…
- Suggestions d'optimisation fiscale par pays (France, Belgique, Maroc…)

### Compte & sauvegarde
- Authentification via **Clerk** (email, Google, etc.)
- Sauvegarde des calculs en base de données (PostgreSQL / Neon)
- Historique des calculs sur `/dashboard/history`
- Certificat PDF officiel numéroté (plan Pro)

### Plans & paiements
| Plan | Prix | Inclus |
|------|------|--------|
| **Gratuit** | 0 € | 1 calcul sauvegardé / an |
| **Pro** | 49 €/an | Calculs illimités, certificat PDF, historique complet |
| **Cabinet** | Sur devis | Multi-clients, usage professionnel |

Paiements gérés via **Stripe** (checkout + webhooks de synchronisation).

### Anti-abus (plan gratuit)
- Gate UI bloquant l'accès aux résultats si la limite annuelle est atteinte
- Champ **SIREN** (9 chiffres) validé en temps réel via l'**API SIRENE officielle** (entreprise.data.gouv.fr)
  - Vérifie que l'entreprise existe et est active
  - Bloque les entreprises radiées
  - Bloque les SIRENs fictifs
- Le SIREN est stocké en DB : **check cross-account** — un même SIREN ne peut être utilisé en plan gratuit qu'une seule fois par an, quelle que soit l'adresse email ou le compte utilisé

---

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | TailwindCSS, shadcn/ui, Framer Motion |
| Formulaires | React Hook Form + Zod |
| Auth | Clerk (@clerk/nextjs v5) |
| Paiements | Stripe + webhooks |
| ORM | Prisma |
| Base de données | PostgreSQL (Neon — serverless) |
| Icônes | Lucide React |
| Déploiement | Vercel |

---

## Architecture des routes

```
src/app/
├── page.tsx                        # Landing page
├── calculate/page.tsx              # Formulaire de calcul (4 étapes)
├── dashboard/history/page.tsx      # Historique des calculs
├── pricing/page.tsx                # Tarifs
├── sign-in/[[...sign-in]]/         # Auth Clerk
├── sign-up/[[...sign-up]]/         # Auth Clerk
└── api/
    ├── calculations/               # CRUD calculs (GET, POST)
    ├── calculations/[id]/          # GET + DELETE calcul unique
    ├── validate-siren/             # Proxy API SIRENE (validation SIREN)
    ├── gold-price/                 # Cours de l'or en temps réel
    ├── user/plan/                  # Plan de l'utilisateur connecté
    ├── stripe/checkout/            # Création session Stripe
    ├── stripe/webhook/             # Webhooks Stripe
    └── dev/make-pro/               # [DEV ONLY] Upgrade utilisateur en Pro
```

---

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL (ou compte [Neon](https://neon.tech))
- Compte [Clerk](https://clerk.com)
- Compte [Stripe](https://stripe.com)

### 1. Cloner et installer

```bash
git clone https://github.com/Yaz1427/zakat-business.git
cd zakat-business
npm install
```

### 2. Variables d'environnement

Copier `.env.example` en `.env.local` et remplir :

```bash
cp .env.example .env.local
```

```env
# Base de données
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Admin (endpoint dev)
ADMIN_SECRET=change_me
```

### 3. Base de données

```bash
npm run db:push      # Applique le schéma Prisma
npm run db:generate  # Génère le client Prisma
```

### 4. Lancer en développement

```bash
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # ESLint
npm run db:push      # Synchroniser le schéma Prisma → DB
npm run db:generate  # Régénérer le client Prisma
npm run db:studio    # Interface visuelle Prisma Studio
```

---

## Endpoint dev : upgrade en Pro

En développement uniquement, un endpoint permet d'upgrader rapidement son compte pour tester les features Pro :

```
GET /api/dev/make-pro?secret=<ADMIN_SECRET>&plan=pro
GET /api/dev/make-pro?secret=<ADMIN_SECRET>&plan=free
```

> ⚠️ Cet endpoint est désactivé automatiquement en production (`NODE_ENV === 'production'`).

---

## Modèle de données (Prisma)

```prisma
model ZakatCalculation {
  id            String   @id @default(cuid())
  userId        String
  companyName   String
  year          Int
  siren         String?  // Anti-bypass cross-account
  cash          Float
  stocks        Float
  receivables   Float
  debts         Float
  supplierDebts Float
  taxDebts      Float
  salaryDebts   Float
  nisabValue    Float
  finalZakat    Float
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model UserSubscription {
  id            String   @id @default(cuid())
  userId        String   @unique
  plan          String   @default("free")
  status        String   @default("inactive")
  archiveAccess Boolean  @default(false)
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  stripePriceId         String?
  stripeCurrentPeriodEnd DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## Licence

Projet personnel — tous droits réservés.
