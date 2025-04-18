# 🎱 Pool League Wallet App

Welcome to the Pool League Wallet App!

This project is designed to modernize our pool league by allowing players to:
- Load money into their digital wallets (pretend for now, real payments coming soon).
- Pay for individual games or table rentals using their wallet balance.
- Manage balances and view payment history through a simple dashboard.

> Future integration with Stripe and PayPal is planned to allow real money top-ups!

---

## 🚀 Features
- **User Login/Register** (local storage for now)
- **Wallet Dashboard** (View balance, add fake money, pay for games/tables)
- **Top-Up Buttons** (+$5, +$10, +$20 with balance cap at $200)
- **Payment Buttons** ($5 per Game, $10 per Table)
- **Fancy Error Modals** (with basic fallback alert support)
- **Admin Dashboard** (manual balance adjustments + view payment history)
- **Mobile-Friendly** (Web app optimized for mobile browsers)

---

## ⚙️ Project Structure

```bash
/pool-league/
 ├── login.html       # Login/Registration page
 ├── dashboard.html   # Wallet dashboard (User view)
 ├── admin.html       # Admin panel (Manual balance adjustments, history)
 └── README.md        # You're here!
