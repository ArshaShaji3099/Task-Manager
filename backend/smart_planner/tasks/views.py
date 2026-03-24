from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

from .models import Task
from .serializers import TaskSerializer, ScheduledTaskSerializer
from .scheduler import greedy_scheduler


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        email    = request.data.get('email', '').strip()

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        return Response({'message': f'Account created for {user.username}!'}, status=status.HTTP_201_CREATED)


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_type = request.query_params.get('user_type', None)
        search    = request.query_params.get('search', None)
        priority  = request.query_params.get('priority', None)

        tasks = Task.objects.all()

        if user_type: tasks = tasks.filter(user_type=user_type)
        if priority:  tasks = tasks.filter(priority=priority)
        if search:    tasks = tasks.filter(title__icontains=search)

        serializer = TaskSerializer(tasks, many=True)
        return Response({'count': tasks.count(), 'tasks': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Task created successfully ✅', 'task': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Task updated successfully ✅', 'task': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Task partially updated ✅', 'task': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        title = task.title
        task.delete()
        return Response({'message': f"Task '{title}' deleted successfully 🗑️"}, status=status.HTTP_204_NO_CONTENT)


class ScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.all()
        if not tasks.exists():
            return Response({'message': 'No tasks found. Please add tasks first.'}, status=status.HTTP_404_NOT_FOUND)

        scheduled  = greedy_scheduler(tasks)
        serializer = ScheduledTaskSerializer(scheduled, many=True)
        at_risk    = [t for t in scheduled if t['status'] == 'at_risk']

        return Response({
            'message': 'Schedule optimized using Greedy Algorithm ✅',
            'total_tasks': len(scheduled),
            'at_risk_count': len(at_risk),
            'scheduled_tasks': serializer.data
        }, status=status.HTTP_200_OK)


class ScheduleByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_type):
        if user_type not in ['student', 'employee']:
            return Response({'message': 'Invalid user_type. Use student or employee.'}, status=status.HTTP_400_BAD_REQUEST)

        tasks = Task.objects.filter(user_type=user_type)
        if not tasks.exists():
            return Response({'message': f'No tasks found for user type: {user_type}'}, status=status.HTTP_404_NOT_FOUND)

        scheduled  = greedy_scheduler(tasks)
        serializer = ScheduledTaskSerializer(scheduled, many=True)
        at_risk    = [t for t in scheduled if t['status'] == 'at_risk']

        return Response({
            'user_type': user_type,
            'total_tasks': len(scheduled),
            'at_risk_count': len(at_risk),
            'scheduled_tasks': serializer.data
        }, status=status.HTTP_200_OK)


class TaskCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        task.is_completed = not task.is_completed
        task.save()
        return Response({
            'message': f"Task marked as {'completed ✅' if task.is_completed else 'incomplete'}",
            'id': task.id,
            'is_completed': task.is_completed
        }, status=status.HTTP_200_OK)