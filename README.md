# English Learning App - Phase 14 Final Release

Welcome to the **English Learning App**! This platform is an interactive, block-based learning platform built with Next.js (App Router), TypeScript, and Tailwind CSS. It is designed from the ground up to provide a gamified, highly engaging, and bilingual (English & Persian) learning experience.

This repository integrates our core learning engines and recently merged parallel tracks (Tracks 1, 2, 3, and 5) to deliver the ultimate interactive language learning journey.

---

## 🌟 Core Features & Architecture

### 📚 2D Deepstash Story Deck & Explorer Grid
- Our UI features a zero-clutter, highly visual aesthetic inspired by platforms like Deepstash.
- The **Explorer Grid** powers the Learner Dashboard (`/dashboard`), offering a seamless Learning Path Map and Mastery Analytics.
- Courses are laid out in a **Vertical Lesson Feed**, letting learners scroll through beautifully choreographed content cards.

### 📝 Notion-Style Editorial Blocks
- Lessons are built using a strict Smart Canvas architecture (defined in `src/types/lesson.ts`).
- Content flows dynamically using blocks like `heading_intro`, `callout`, and `toggle_table`, offering Notion-style readability and rich editorial layouts.

### 🎬 Rive/Vector 15s Scenes (Dual-Mode Motion Architecture)
- Visual storytelling is powered by the `motion_canvas` block, enforcing short, engaging 15-second visual bursts (strictly validated to <= 60s).
- The platform uses a **Dual-Mode Motion Architecture**: Interactive WebAssembly state machines via `@rive-app/react-canvas` seamlessly fall back to reactive Framer Motion SVG vector scenes when necessary.
- Lazy-loaded via `next/dynamic` (`src/components/motion/LazyMotionScene.tsx`) with zero Cumulative Layout Shift (CLS).

### 🧩 4 Interactive Checkpoint Modes
Our learning engine actively verifies comprehension through four distinct `interactive_checkpoint` modes:
1. **Slot Matching:** Drag-and-drop or tap-to-match mechanics.
2. **Branching Decision:** Narrative-style "choose your own adventure" nodes.
3. **Micro-Sprint Reflex:** High-speed active recognition challenges.
4. **Story Question Box:** An Instagram-style text input box for quick answers.

### 🎮 Gamification Engine (XP, Hearts, SRS, Streaks, Leagues)
- Powered by `useGamificationStore` (Zustand with persist).
- **XP & Streaks:** Earn XP and build daily streaks (10+ mins active learning or 1 completed lesson).
- **Heart Economy:** A 5-Heart energy system with a 30-minute regeneration timer. Learners who reach 0 hearts can *always* recover via Spaced Repetition System (SRS) micro-reviews—they are never hard-blocked.
- **Tiered Leagues:** Compete dynamically based on mastery and XP accumulation.

### 🛠 Supabase SQL Backend (Local-First Sync)
- Secure backend layer built on PostgreSQL with Row Level Security (RLS), Supabase Auth, and Edge Functions.
- **Resilient Fallback:** The client safely falls back to Local-First Sync Mode for guest users or local development when environment variables are missing.

### 🎨 Lesson Builder Studio (`/builder`)
- A specialized visual authoring tool for creators.
- Features a split-screen property editor and live `SmartLessonRenderer`.
- All created content is instantly validated via pure TypeScript validators (`lesson-validator.ts`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing
We utilize pure TypeScript validation modules (zero external test runners like Jest required for core logic).
```bash
# Run core validation checks
npx tsx src/lib/__tests__/lesson-validator.test.ts
```

---

## 🌐 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Ensure your Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are configured in your Vercel project settings.

---
---

# اپلیکیشن آموزش زبان انگلیسی - نسخه نهایی فاز ۱۴

به **اپلیکیشن آموزش زبان انگلیسی** خوش آمدید! این پلتفرم یک بستر آموزشی تعاملی و مبتنی بر بلاک (Block-based) است که با Next.js (App Router)، TypeScript و Tailwind CSS ساخته شده است. این سیستم از پایه برای ارائه یک تجربه یادگیری گیمیفای‌شده، بسیار جذاب و دوزبانه (انگلیسی و فارسی) طراحی شده است.

## 🌟 ویژگی‌های کلیدی و معماری

### 📚 کارت‌های داستانی Deepstash و شبکه کاوشگر
- رابط کاربری ما دارای زیبایی بصری بالا و بدون شلوغی است که از پلتفرم‌هایی مانند Deepstash الهام گرفته شده است.
- داشبورد یادگیرنده (`/dashboard`) مسیر یادگیری و تحلیل‌های تسلط را نمایش می‌دهد.
- دوره‌ها در یک **فید عمودی** مرتب شده‌اند که به یادگیرندگان اجازه می‌دهد میان کارت‌های محتوای زیبا اسکرول کنند.

### 📝 بلاک‌های محتوایی به سبک Notion
- درس‌ها با استفاده از معماری بوم هوشمند (Smart Canvas) ساخته می‌شوند.
- محتوا به صورت پویا با استفاده از بلاک‌هایی مانند `heading_intro`، `callout` و `toggle_table` جریان می‌یابد.

### 🎬 صحنه‌های انیمیشنی Rive/Vector (معماری حرکتی دوگانه)
- داستان‌سرایی بصری توسط بلاک `motion_canvas` پشتیبانی می‌شود و انیمیشن‌های ۱۵ ثانیه‌ای جذاب ارائه می‌دهد.
- پلتفرم از یک معماری دوگانه استفاده می‌کند: ماشین‌های حالت WebAssembly تعاملی (Rive) به صورت یکپارچه در صورت نیاز به صحنه‌های برداری Framer Motion تغییر حالت می‌دهند.

### 🧩 ۴ حالت ایستگاه بازرسی تعاملی
موتور یادگیری ما به صورت فعال درک مطلب را از طریق ۴ حالت ارزیابی می‌کند:
۱. **تطبیق جایگاه (Slot Matching)**
۲. **تصمیم‌گیری شاخه‌ای (Branching Decision)**
۳. **بازتاب سرعت مایکرو (Micro-Sprint Reflex)**
۴. **جعبه سوال داستانی (Story Question Box):** مشابه اینستاگرام برای پاسخ‌های سریع.

### 🎮 موتور گیمیفیکیشن (XP، قلب‌ها، SRS، استریک‌ها، لیگ‌ها)
- **XP و استریک (Streaks):** با ۱۰ دقیقه یادگیری فعال در روز، استریک خود را حفظ کنید.
- **اقتصاد قلب‌ها:** سیستم انرژی ۵ قلبی. در صورت اتمام قلب‌ها، یادگیرنده هرگز مسدود نمی‌شود و می‌تواند از طریق مرورهای SRS قلب خود را بازیابی کند.
- **لیگ‌های رده‌بندی:** رقابت بر اساس امتیاز XP.

### 🛠 بک‌اند Supabase
- لایه بک‌اند امن بر پایه PostgreSQL، همراه با RLS و احراز هویت.
- در صورت نبود متغیرهای محیطی، برنامه به صورت خودکار در حالت محلی (Local-First Sync) اجرا می‌شود.

### 🎨 استودیوی سازنده درس (`/builder`)
- یک ابزار تالیف بصری پیشرفته برای تولیدکنندگان محتوا با قابلیت پیش‌نمایش زنده.

---
طراحی شده با ❤️ برای یادگیری بهتر زبان انگلیسی.
