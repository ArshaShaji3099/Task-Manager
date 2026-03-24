from django.urls import path
from .views import TaskCompleteView, TaskListView, TaskDetailView, ScheduleView, ScheduleByUserView

urlpatterns = [
    # Task CRUD
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:pk>/complete/', TaskCompleteView.as_view(), name='task-complete'),  # ← NEW


    # Schedule (Greedy Algorithm)
    path('schedule/', ScheduleView.as_view(), name='schedule'),
    path('schedule/<str:user_type>/', ScheduleByUserView.as_view(), name='schedule-by-user'),
]