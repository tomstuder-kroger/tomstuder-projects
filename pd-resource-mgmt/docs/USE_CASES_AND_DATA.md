# Product Design Resource Management Application
## Use Cases and Data Overview

**Document Version:** 1.0
**Date:** 2026-08-13
**Audience:** Strategic & Portfolio Operations
**Purpose:** Build vs Buy Evaluation & Roadmap Planning

---

## Executive Summary

The Product Design Resource Management application provides design leadership with visibility into team capacity, allocation, utilization, and financial performance across portfolios. It enables data-driven decisions about resource planning, portfolio investment, and ROI measurement.

**Key Value Propositions:**
- **Financial Visibility:** Track $3.2M+ annual design investment across portfolios
- **Capacity Optimization:** Identify underutilized designers and allocation gaps
- **ROI Measurement:** Connect design spend to business outcomes at portfolio and team levels
- **Resource Planning:** Support headcount and budget planning with real-time utilization data

---

## Primary Users

### Design Leadership (Primary)
- **Title:** Head of Product Design, Design Directors, Design Managers
- **Needs:** Portfolio-level visibility, capacity planning, budget management, ROI reporting
- **Frequency:** Weekly reviews, quarterly planning

### Portfolio Managers (Secondary)
- **Title:** Portfolio Product Managers, Portfolio Leads
- **Needs:** Understand design resource allocation to their portfolio, justify design investment
- **Frequency:** Monthly reviews, planning cycles

### Resource Managers (Secondary)
- **Title:** Program Managers, Resource Planners
- **Needs:** Track individual designer allocations, identify capacity constraints
- **Frequency:** Daily/weekly allocation management

---

## Use Cases

### UC-1: Monitor Team Capacity and Utilization
**Actor:** Design Manager
**Goal:** Understand current team capacity and identify over/under-utilized designers
**Value:** Optimize resource allocation to prevent burnout and maximize throughput

**Flow:**
1. Review team-wide utilization metrics (target: 80%)
2. Identify designers above/below target utilization
3. See capacity breakdown by level (APD, PD, SPD)
4. Spot unallocated hours available for assignment

**Success Metrics:**
- Team maintains 75-85% utilization
- No designer exceeds 100% allocation
- Unallocated capacity is visible and actionable

---

### UC-2: Allocate Designers to Product Teams
**Actor:** Design Manager, Resource Manager
**Goal:** Assign designers to product teams based on capacity and portfolio needs
**Value:** Ensure optimal distribution of design talent across initiatives

**Flow:**
1. View individual designer's current allocations
2. Adjust allocation percentages across product teams
3. Ensure total allocation equals 100% per designer
4. See real-time impact on team costs and capacity

**Success Metrics:**
- All designers have clear team assignments
- Allocations sum to 100% per designer
- Product teams have appropriate design coverage

---

### UC-3: Track Portfolio Investment and ROI
**Actor:** Design Director, Portfolio Manager
**Goal:** Measure design investment per portfolio and compare to business outcomes
**Value:** Justify design budget and prioritize portfolio investments

**Flow:**
1. View monthly/annual run rate by portfolio
2. Compare design costs across portfolios (Item, Assortment, Supplier)
3. Input outcome values (revenue, cost savings, user impact)
4. Calculate and display ROI by portfolio and team

**Success Metrics:**
- Clear visibility into design spend per portfolio
- ROI calculated for portfolios with complete outcome data
- Ability to compare investment vs value across portfolios

---

### UC-4: Plan Headcount and Budget
**Actor:** Design Director
**Goal:** Forecast design costs and evaluate headcount scenarios
**Value:** Support annual planning and mid-year budget adjustments

**Flow:**
1. Review current headcount by level (APD, PD, SPD)
2. See total monthly and annual run rates
3. Understand cost per designer by level
4. Model impact of adding/removing headcount

**Success Metrics:**
- Accurate monthly run rate calculations
- Clear breakdown of costs by level and employment type
- Data exports for finance review

---

### UC-5: Report on Team Performance
**Actor:** Design Manager
**Goal:** Generate reports for leadership showing team metrics
**Value:** Communicate team health and resource needs to stakeholders

**Flow:**
1. Access dashboard with key metrics (utilization, run rate, ROI)
2. Review team allocation across portfolios
3. Export data for presentations
4. Share current state with leadership

**Success Metrics:**
- One-click access to key metrics
- Export functionality for reporting
- Clear, stakeholder-friendly visualizations

---

## Data Model

### Core Entities

#### Designer
Individual product designers on the team.

**Key Attributes:**
- Name
- Level (APD, PD, SPD)
- Employment Status (FTE, SOW, SOW Koncert)
- Allocations (array of team assignments with percentages)

**Calculated Metrics:**
- Monthly Run Rate
- Utilization %
- Available Hours (annual)
- Allocated Hours (annual)

---

#### Product Team
Teams that designers are allocated to (e.g., "Item Pricing Team").

**Key Attributes:**
- Team Name
- Portfolio (parent relationship)

**Calculated Metrics:**
- Team Monthly Cost (sum of allocated designer costs)
- Designer Count
- Outcomes Value (manually entered)
- ROI % (outcomes / annual cost)

---

#### Portfolio
Top-level groupings of product teams (e.g., Item, Assortment, Supplier).

**Key Attributes:**
- Portfolio Name

**Calculated Metrics:**
- Portfolio Monthly Cost
- Total Outcomes
- Portfolio ROI
- Designer Count

---

#### Capacity Settings
Global configuration for capacity calculations.

**Key Attributes:**
- Standard Hours per Week (40)
- Weeks per Year (52)
- PTO Hours per Year
- Holidays Hours per Year
- L&D Hours per Year
- OKR Planning Hours per Year

**Rates by Level:**
- APD: Actual Rate, Blended Rate
- PD: Actual Rate, Blended Rate
- SPD: Actual Rate, Blended Rate

---

#### Outcomes
Business value delivered by product teams (manually entered).

**Key Attributes:**
- Product Team ID (foreign key)
- Outcomes Value (annual dollar value: revenue, cost savings, etc.)

---

### Data Relationships

```
Portfolio (1) ──→ (many) Product Teams
Product Team (1) ──→ (many) Designer Allocations
Designer (1) ──→ (many) Allocations
Allocation (many) ──→ (1) Product Team
Product Team (1) ──→ (1) Outcomes
```

---

### Calculation Formulas

**Available Hours per Designer:**
```
(40 hours/week × 52 weeks) - PTO - Holidays - L&D - OKR Planning
= Standard: 1,840 hours/year
```

**Allocated Hours per Designer:**
```
Available Hours × (Total Allocation % / 100)
```

**Utilization %:**
```
(Allocated Hours / Available Hours) × 100
```

**Monthly Run Rate per Designer:**
```
(Blended Rate × Available Hours) / 12
```

**Team Monthly Cost:**
```
Sum of (Designer Monthly Rate × Allocation % to Team)
```

**ROI %:**
```
(Outcomes Value / Annual Team Cost) × 100
```

---

## Data Sources

### Current State (MVP)
- **Data Entry:** Manual input via application UI
- **Storage:** Browser localStorage + JSON export/import
- **Initialization:** Placeholder data with 11 sample designers

### Potential Future Integrations
- **HRIS Systems:** Import designer roster, levels, employment status
- **Financial Systems:** Import actual rates and cost center data
- **Project Management Tools:** Import team structures and allocations
- **OKR/Goals Systems:** Import outcome metrics automatically

---

## Sample Data

### Designers (11 total)
- **2 APD** (Associate Product Designers)
- **5 PD** (Product Designers)
- **4 SPD** (Senior Product Designers)

**Employment Mix:**
- 8 FTE
- 2 SOW
- 1 SOW Koncert

### Portfolios (3 total)
- Item
- Assortment
- Supplier

### Product Teams (10 total)
- Item Portfolio: 4 teams
- Assortment Portfolio: 3 teams
- Supplier Portfolio: 3 teams

### Outcomes Range
- $100K - $600K annual value per team
- Total portfolio value: ~$3.3M annually

### Financial Metrics
- **Total Monthly Run Rate:** ~$264K
- **Annual Design Investment:** ~$3.2M
- **Average Utilization:** 100% (all designers fully allocated)
- **Overall ROI:** 821% (outcomes / costs)

---

## Build vs Buy Considerations

### Build (Current MVP)
**Pros:**
- Custom-tailored to design org structure
- Full control over calculations and metrics
- Lightweight, browser-based (no infrastructure)
- Rapid iteration on feedback

**Cons:**
- Manual data entry required
- No integrations with existing systems
- Limited user access controls
- No audit trail or version history

### Buy (Commercial Tools)
**Comparison Points:**
- Resource management tools (Float, Resource Guru, Mavenlink)
- Financial planning tools (Adaptive Insights, Anaplan)
- Custom integrations with HRIS/Finance

**Evaluation Criteria:**
- Design-specific metrics support (utilization, ROI by portfolio)
- Flexibility for custom calculations
- Integration capabilities
- Total cost of ownership
- Time to value

---

## Roadmap Potential

### Phase 1 (Current MVP)
- Individual Designers page
- Team Summary page
- Manual allocation management
- Core metrics and visualizations

### Phase 2 (Planned)
- Portfolio Breakdown page
- Outcomes Tracker page
- Dashboard/Home page
- Enhanced filtering and sorting

### Phase 3 (Future)
- Scenario planning (headcount modeling)
- Historical trending (utilization over time)
- HRIS integration (auto-sync designers)
- Financial system integration (actual costs)
- Advanced analytics (predictive capacity planning)

---

## Questions for Build vs Buy Decision

1. **Data Volume:** How many designers will this scale to? (Current: 11, Future: 50+, 100+?)
2. **Integration Requirements:** Critical to connect to HRIS/Finance systems, or manual OK?
3. **User Access:** How many users need access? Role-based permissions needed?
4. **Data Sensitivity:** Does financial data require SOC2/audit compliance?
5. **Maintenance:** Can we commit to ongoing maintenance and feature development?
6. **Timeline:** How quickly do we need full functionality? (MVP: 2 weeks, Full: 3 months)

---

## Appendix: Key Metrics Glossary

- **Available Hours:** Total hours a designer can work in a year after PTO, holidays, etc.
- **Allocated Hours:** Hours assigned to specific product teams
- **Utilization %:** Percentage of available hours that are allocated (target: 75-85%)
- **Run Rate:** Monthly cost of a designer or team based on blended rates
- **Blended Rate:** Hourly rate including overhead, benefits, etc.
- **Actual Rate:** Direct hourly cost
- **Outcomes Value:** Business value delivered (revenue, cost savings, user impact)
- **ROI:** Return on investment (outcomes / annual cost × 100)
