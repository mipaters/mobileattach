# Rogers Mobile Attach Agent

**The right recommendation. The right bundle. The right moment.**

Rogers Mobile Attach Agent is a polished, front-end-only concept demonstration of an agentic sales-assistance and digital-commerce experience. It shows how customer needs, current basket context, synthetic eligibility, inventory, product suitability, transparent bundle choices, human decisions, outcomes, and commercial measurement can work together.

> **Synthetic-data disclaimer:** Concept demonstration using synthetic customer, product, catalogue, pricing, eligibility, inventory, financial, interaction, and outcome data. Products, prices, recommendations, eligibility results, financial values, and business outcomes are illustrative and do not represent current Rogers offers, customers, systems, or forecasts.

## Business problem

Device purchases are high-intent moments, but employees and customers can struggle to find the most suitable combination of device, plan, accessories, protection, and household services. The demonstration explores how Rogers could improve conversion, attachment, transaction value, confidence, and sales consistency while preserving suitability, transparency, consent, and human control.

## Target users

- Executives and commercial leaders reviewing attach, conversion, ARPU, transaction value, margin, customer outcomes, and governance
- Retail and contact-centre employees assisting a customer
- Digital-commerce, product, merchandising, sales operations, finance, and customer-experience teams

## Agent roles

1. **Mobile Attach Supervisor Agent** orchestrates the journey and applies authority rules.
2. **Context Agent** assembles permitted customer, need, budget, product, household, and basket context.
3. **Recommendation Agent** ranks suitable eligible products and explains alternatives and exclusions.
4. **Bundle Optimization Agent** proposes coherent Essential, Recommended, and Premium bundles with transparent optional items.

The agents recommend only. The employee explains, the customer decides, and existing commerce systems would execute a real transaction.

## Primary scenario

Jordan Lee is a synthetic wireless customer replacing a three-year-old premium smartphone because of battery degradation and camera quality. Jordan values photography and travel, targets a $115 monthly budget and $150 upfront budget, and is interested in protection while remaining price-conscious.

The deterministic default recommendation is the fictional **Northstar Pro 256** with **Infinite Select 75**, plus clearly optional ImpactGuard Case, ClearShield Screen Protection, Device Care Plus, Travel Pass Flex, and an additional-line opportunity.

## Application sections

1. Executive Sales Dashboard
2. Customer and Basket
3. Agent Recommendation
4. Bundle Builder
5. Product Comparison
6. Assisted Sale
7. Sales Performance
8. Value and ROI
9. Microsoft Architecture
10. Governance and Controls

## Executive Demo Overview

Use the persistent **Executive Demo Overview** button in the application header. Select any visual tile directly or use Previous, Next, Auto Play, Pause, Restart, and Exit Overview for a guided demonstration.

## Local installation

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```powershell
npm run build
```

The static output is generated in `dist`.

## Repository structure

```text
src/
  App.tsx       Application shell, routes, pages, interactions, charts, and shared components
  data.ts       Stable synthetic catalogue, customer, bundles, agents, KPIs, and ROI assumptions
  types.ts      Strongly typed business entities
  index.css     Tailwind layers, shared component styles, focus states, and animation
  main.tsx      React entry point
staticwebapp.config.json
tailwind.config.js
vite.config.ts
```

## Azure Static Web Apps deployment

1. Push the repository to GitHub.
2. Create an Azure Static Web App and connect the GitHub repository.
3. Use `/` as the application location.
4. Leave the API location empty.
5. Use `dist` as the output location.
6. Use `npm run build` as the build command if configuring the workflow manually.

`staticwebapp.config.json` provides the SPA navigation fallback required for direct route refreshes.

## Architecture summary

The architecture page proposes a Microsoft foundation using:

- Microsoft Fabric, OneLake, Data Factory, and Real-Time Intelligence
- Microsoft Foundry, Azure OpenAI, Azure Machine Learning, and Azure AI Search
- Azure API Management, Functions, Logic Apps, and Event Hubs
- Power BI for semantic models and executive reporting
- Microsoft Entra ID, managed identities, Key Vault, Purview, Defender for Cloud, Azure Monitor, and Application Insights

All Rogers system connections shown are conceptual integration points. This repository has no backend, API keys, authentication, or live system integration.

## Governance principles

- Agents recommend; customers and authorized employees decide.
- No product is added without clear confirmation.
- Optional products remain visibly optional and removable.
- Suitability and affordability matter more than simply maximizing price.
- Eligibility, inventory, compatibility, promotion status, and approved pricing are validated.
- Recommendations expose reasons, trade-offs, confidence, and exclusions.
- Overrides, approvals, choices, and outcomes are auditable.
- Protected characteristics must not be used for discriminatory selling.
- The experience cannot approve a discount, modify a real order, charge a customer, or make an autonomous customer-impacting decision.

## Production integration requirements

A production implementation would require approved identity and access controls, consent and purpose enforcement, API contracts, catalogue and pricing masters, eligibility and inventory services, order-management integration, monitoring, model and prompt evaluation, data-retention controls, threat modelling, accessibility testing, privacy review, legal review, responsible-AI review, and controlled experimentation.

## Recommended next steps

1. Validate the frontline workflow with retail, digital, contact-centre, product, compliance, and accessibility stakeholders.
2. Establish measurable suitability, commercial, customer, and governance outcomes.
3. Define the approved data contract and authority model.
4. Prototype read-only integrations with catalogue, eligibility, inventory, and outcome systems.
5. Run responsible-AI, security, privacy, and human-factors assessments before any customer-facing pilot.
