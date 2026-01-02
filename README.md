# Savings Group Web App

A React + TypeScript single-page app that simulates a 12-member savings group with fixed tiers, weekly interest accrual, withdrawals, and live totals.

## Features
- Register students with name and one of three fixed tiers (10k @5%, 20k @10%, 30k @20%).
- Enforced tier validation (deposit must match the selected tier).
- Weekly simulator to advance time; projected payout updates automatically.
- Dashboard totals: total contributed, aggregate weekly interest, and projected payout for the current week.
- Withdrawals remove a student, shrink totals, and free a slot for a new member (max 12 concurrent).
- Clean responsive UI built with Vite, React, and TypeScript.

## Getting Started
Prerequisites: Node 18+ and npm.

```bash
npm install
npm run dev
```
Visit the printed local URL (default `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## How to Use
1. Enter a student name, choose a tier, and keep the deposit amount at the fixed value shown for that tier.
2. Click **Add to group** to fill a slot. The dashboard and member table will reflect weekly interest and projected payout (principal + weekly interest × weeks active).
3. Use **Advance week** to simulate time; payouts and totals grow per week.
4. Click **Withdraw & remove** beside any member to pay them out, remove them from the list, and open a slot for another student.

## Notes on Calculations
- Weekly interest is derived from the tier (e.g., 30,000 × 20% = 6,000 per week).
- Projected payout = principal + (weekly interest × weeks active). A member starts earning from the week they join.
- Slots are capped at 12 concurrent members.

## Tech Stack
- React 18 with TypeScript
- Vite for dev/build tooling
- CSS for styling (no external UI kit)
