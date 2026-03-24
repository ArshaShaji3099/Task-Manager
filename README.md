# ⚡ TaskFlow — Smart Schedule Planner

A full-stack AI-powered task scheduling application built with **Django REST Framework** and **React Vite**. TaskFlow uses a **Greedy Algorithm** to automatically optimize your task schedule based on deadlines and priority.

---

## 🧠 How It Works

TaskFlow uses a **Greedy Algorithm** to schedule tasks:
1. Sorts tasks by **earliest deadline first**
2. Among equal deadlines, sorts by **highest priority first**
3. Assigns start/end times starting from 8:00 AM
4. Marks tasks as `scheduled` or `at_risk` based on whether they can complete before the deadline

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 JWT Authentication | Secure login & register with access/refresh tokens |
| 📋 Task Management | Create, edit, delete, complete tasks |
| 🧠 Greedy Scheduling | Auto-schedule tasks by deadline & priority |
| 📊 Dashboard | Charts — priority, user type, completion, timeline |
| 📄 Export PDF | Download schedule as a styled PDF |
| 🔍 Search & Filter | Filter by user type, priority, status |
| ⚠️ Smart Alerts | Overdue and Due Today notifications |
| 🌙 Dark / Light Mode | Toggle between themes |
| ✨ Animations | Framer Motion + floating particles |
| 📱 Responsive | Works on all screen sizes |

---

## 🛠️ Tech Stack

### Backend
| Technology | Usage |
|------------|-------|
| Python 3.x | Core language |
| Django 5.x | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT Authentication |
| MySQL | Database |
| Greedy Algorithm | Task scheduling logic |

### Frontend
| Technology | Usage |
|------------|-------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS v3 | Styling |
| Framer Motion | Animations |
| Recharts | Data visualization |
| jsPDF + AutoTable | PDF export |
| Canvas API | Particle background |

---

## 📁 Project Structure

```
Task-Manager/
├── backend/
│   ├── smart_planner/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── tasks/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── scheduler.py      ← Greedy Algorithm
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── AddTask.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── AlertBanner.jsx
│   │   │   └── ParticleBackground.jsx
│   │   ├── App.jsx
│   │   └── api.js
│   └── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL

---

### 🔧 Backend Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create MySQL database
# Open MySQL and run:
# CREATE DATABASE task_manager;

# 6. Update database settings in smart_planner/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'task_manager',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# 7. Run migrations
python manage.py makemigrations
python manage.py migrate

# 8. Create superuser (optional)
python manage.py createsuperuser

# 9. Start backend server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/` | Register new user | ❌ |
| POST | `/api/auth/login/` | Login & get JWT tokens | ❌ |
| POST | `/api/auth/refresh/` | Refresh access token | ❌ |
| GET | `/api/tasks/` | Get all tasks | ✅ |
| POST | `/api/tasks/` | Create task | ✅ |
| GET | `/api/tasks/<id>/` | Get single task | ✅ |
| PUT | `/api/tasks/<id>/` | Update task | ✅ |
| DELETE | `/api/tasks/<id>/` | Delete task | ✅ |
| PATCH | `/api/tasks/<id>/complete/` | Toggle complete | ✅ |
| GET | `/api/schedule/` | Get optimized schedule | ✅ |
| GET | `/api/schedule/<user_type>/` | Schedule by user type | ✅ |

---

## 🧮 Greedy Algorithm

```python
def greedy_scheduler(tasks):
    # Sort by earliest deadline, then highest priority
    sorted_tasks = sorted(tasks, key=lambda t: (
        t.deadline,
        PRIORITY_ORDER.get(t.priority.lower(), 99)
    ))
    
    current_time = 8:00 AM today
    
    for task in sorted_tasks:
        # Assign start and end times
        start_time = current_time
        end_time = start_time + duration
        
        # Mark as at_risk if cannot complete before deadline
        status = 'scheduled' if end_time <= deadline else 'at_risk'
        
        current_time = end_time
```

**Time Complexity:** O(n log n) — dominated by sorting step

---

## 👩‍💻 Developer

**Arsha Shaji**
- GitHub: [@ArshaShaji3099](https://github.com/ArshaShaji3099)



---

> Built with ❤️ using Django REST Framework + React Vite
