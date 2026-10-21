# BUILD LHS — Study Planner & Daily Routine Tracker

A tactile, neumorphic + glassmorphic web application designed to help students plan schedules, track deep work sprints, master curriculums, and build long-term study streaks.

Recreated with pixel-crafted fidelity from the 3D claymorphic music dashboard style, adapted into a high-productivity academic planning environment.

---

## 🎨 Visual Design & Aesthetics

- **Soft Neumorphic & Frosted Glassmorphism**: High-contrast dark navy sidebar (`#202D42`), soft blue-grey canvas (`#9FB3C8`), frosted glass cards with specular inner highlights, pill controls, and tactile pressed states.
- **3D Visuals & Clay Mascot Assets**:
  - **Hero Shelf**: 3D character in blue hoodie with headphones resting at his study desk with a potted succulent plant.
  - **Profile Avatar**: 3D clay headshot with glowing streak badge.
  - **Cozy Study Nook**: 3D miniature study armchair with warm floor lamp and stacked textbooks.
  - **Mascot Banner**: 3D smiling star mascot with motivational consistency reminders.
- **Color Palette**:
  - Dark Navy Sidebar: `#202D42` / `#2B3A55`
  - Slate Background: `#9FB3C8` (Light) / `#101827` (Dark Mode)
  - Teal: `#5FB3B3`
  - Soft Blue: `#6A9AC4`
  - Purple/Lavender: `#7B7FBF`
  - Coral / Rose: `#E57373`
  - Mint / Emerald: `#4EBA88`
  - Amber: `#F6B26B`

---

## 🚀 Tech Stack

- **Framework**: React 18 / 19 + Vite
- **Styling**: Tailwind CSS (custom theme, colors, and neumorphic box-shadow tokens)
- **Charts**: Recharts (Responsive bar chart with pill caps, donut chart with legends, and line chart)
- **State Management**: Zustand with `persist` middleware (cached in `localStorage` under `build-lhs-v1`)
- **Date Handling**: `date-fns`
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom`
- **Animations & Sound**: Canvas-Confetti, Web Audio API sound synthesizer (Pomodoro bell, task complete chime, gentle rain, white noise)

---

## 🌟 Key Features

### 1. Dashboard
- **Dynamic Greeting**: Time-based greeting ("Good Morning / Afternoon / Evening, Aryan!")
- **4 Tactile Stat Cards**: Tasks Completed, Study Hours, Current Streak (7 days), Pending Tasks (with +/- weekly changes).
- **Study Overview Bar Chart**: Weekly study hours with pill caps and time filters ("This Week", "Last Week").
- **Subject Distribution Donut Chart**: Visual time breakdown across Mathematics, Physics, Computer Science, Chemistry, and English.
- **Today's Tasks List**: Play timer directly from task, interactive completion checkbox with chime and confetti celebration.
- **Daily Mix Routine Card**: Cozy 3D armchair scene with routine sprint launcher.
- **Stay Consistent Mascot Banner**: Motivational reminder with quick link to long-term goals.

### 2. Planning Views
- **Today & Next Day Timeline** (`/today`):
  - Hourly timeline from 06:00 to 23:00.
  - Active time indicator ("NOW").
  - Click any empty time slot to plan a study session.
  - Overdue task detector with one-click "Carry forward to today".
- **Weekly 7-Day Board** (`/week`):
  - Monday to Sunday column board.
  - Daily completion rate progress bar.
  - Quick task adder for each day.
- **Monthly Interactive Calendar** (`/month`):
  - Full-month grid with subject-colored task dots.
  - Click any day to open a details modal and add tasks.
- **Yearly 12-Month Master Strategy** (`/year`):
  - 12-month curriculum milestones and target study hours.
  - Visual monthly completion progress bars.

### 3. Daily Routine Builder (`/routine`)
- Pre-built templates: **"Weekday High-Focus Schedule"** and **"Weekend Deep Sprint"**.
- Time-blocked schedule (Wake up, Math problem sets, Lectures, Physics deep work, Breaks, Anki review).
- One-click **"Apply to Today"** or **"Apply to Tomorrow"** automatically populates your schedule with scheduled tasks!

### 4. Interactive Pomodoro Study Timer (`/timer`)
- 25m Focus / 5m Short Break / 15m Long Break intervals.
- Links timer session to specific tasks and subjects.
- **Offline Web Audio Ambient Soundscapes**:
  - Gentle Rain 🌧️
  - Soft White Noise 💨
  - Tibetan Bell on session completion 🔔
- Automatically logs minutes to the subject and updates the 365-day heatmap and weekly analytics!

### 5. Curriculum & Goal Trackers
- **Subjects Tracker** (`/subjects`): Syllabus completion %, chapter counts, and weekly hour targets.
- **Goals Tracker** (`/goals`): Long-term milestones (e.g. "Score 95% in Board Exams", "Complete AP Physics C") with progress bars and linked task counts.

### 6. Analytics & 365-Day Study Heatmap (`/analytics`)
- GitHub-style study intensity heatmap with date-hover tooltips.
- Monthly planned vs completed tasks trend line chart.
- Focus efficiency and streak tracking metrics.

### 7. Offline Storage, Backup & Settings (`/settings`)
- Avatar switcher (Choose between 3D clay avatars).
- Pomodoro duration customizations.
- **Export Backup (JSON)**: Download your entire planner state.
- **Import Backup (JSON)**: Restore tasks and routines from file.
- **Reset All Data**: Reset to default rich seed data anytime.
- Keyboard shortcuts: `[N]` for New Task.

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Open in browser:
# http://127.0.0.1:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🌐 Deployment Instructions

### Deploy to Vercel
1. Install Vercel CLI or import your GitHub repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**.

### Deploy to Netlify
1. Connect your repository to [Netlify](https://www.netlify.com).
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. In Netlify's build settings, set single-page app rewrite rule in `public/_redirects`:
   ```
   /*    /index.html   200
   ```
5. Click **Deploy Site**.
