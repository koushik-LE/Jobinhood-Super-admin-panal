# Project H Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features (Detailed)

### 1. Authentication & Security
- **Login & Logout:** Secure login with JWT-based session management. Users can log in with their credentials and securely log out, ensuring session privacy.
- **OTP Verification:** Two-step authentication using OTP sent to the user's email for added security during login or sensitive actions.
- **Password Reset:** Users can request a password reset, receive an OTP, and set a new password securely.
- **Session Management:** Auth tokens are stored securely in cookies, and session expiration is handled automatically.

### 2. Dashboard & Analytics
- **Overview Dashboard:** Visual summary of key metrics such as total companies, credits distributed, revenue, and user activity.
- **Interactive Charts:** Dynamic charts and graphs (using ECharts) to visualize company and credit data over time and by location.
- **Date Filtering:** Filter dashboard data by custom date ranges (today, last 7 days, last 30 days, etc.).

### 3. Company Management
- **Company List:** View all companies in a sortable, searchable, and paginated table with key details (name, contact, status, credits, revenue).
- **Add Company:** Add a new company with detailed information, including contact, address, domain, and subscription type.
- **Edit Company:** Update company details, including credits, subscription, and contact info.
- **Activate/Deactivate Company:** Change the status of a company to control access and visibility.
- **Bulk Upload via Excel:** Upload multiple companies at once using a formatted Excel file. The system validates required fields and provides feedback on errors.
- **Download as Excel:** Export company data to Excel for offline analysis or reporting.
- **Company Details Page:** View detailed information about a specific company, including users, credits, and transaction history.

### 4. User Management
- **Add User to Company:** Add new users to a company, specifying their name, email, and designation. Email validation ensures only valid addresses are accepted.
- **User List:** View and manage users associated with each company.

### 5. Credits Management
- **Credits Table:** View all credit transactions, including company, date, amount, bank, payment mode, and transaction number.
- **Add Credits:** Assign credits to companies, specifying transaction details and payment information.
- **Edit Credits:** Update existing credit transactions for accuracy.
- **Delete Credits:** Remove incorrect or obsolete credit transactions.
- **Filter & Search:** Filter credit transactions by company, date, or search terms for quick access.

### 6. Profile Management
- **Profile Picture:** Upload, edit, or delete your profile picture for a personalized experience.
- **Edit Profile:** (If implemented) Update your personal information and contact details.

### 7. Email & Domain Validation
- **Email Validation:** Real-time validation of email addresses to ensure only valid company emails are used.
- **Domain Validation:** Check if a company domain is valid and reachable before adding or updating company information.

### 8. Notifications & Feedback
- **Toast Notifications:** Instant feedback for user actions (success, error, info) using toast popups.
- **Popup Messages:** Important confirmations and warnings are shown in modal dialogs for clarity.

### 9. Responsive & Modern UI
- **Mobile Friendly:** Fully responsive design for use on desktops, tablets, and mobile devices.
- **Modern Components:** Built with Tailwind CSS, Shadcn/UI, and Radix UI for a clean, accessible, and interactive user experience.
- **Dark Mode:** (If implemented) Support for light and dark themes.

### 10. Security & Best Practices
- **Secure API Calls:** All API requests are authenticated and validated.
- **Form Validation:** All forms use Zod for robust client-side validation.
- **Environment Variables:** Sensitive configuration is managed via environment variables.

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd project-h-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add required variables (e.g., `NEXT_PUBLIC_SUPER_ADMIN_HOST`, etc.).

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Tech Stack

- Next.js (App Router)
- React 18
- Redux Toolkit
- Tailwind CSS
- Shadcn/UI & Radix UI
- Framer Motion
- ECharts
- Axios
- Zod (validation)
- XLSX (Excel import/export)

## How to Use

- **Login:** Use your credentials to log in.
- **Dashboard:** View analytics and quick stats.
- **Companies:** Add/edit companies, upload/download Excel, manage users and credits.
- **Credits:** Add/edit/delete credit transactions.
- **Profile:** Manage your profile picture.
- **Reset Password:** Use the forgot password flow if needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
