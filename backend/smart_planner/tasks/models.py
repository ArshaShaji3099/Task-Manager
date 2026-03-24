from django.db import models

# Create your models here.
class Task(models.Model):
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('employee', 'Employee'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    duration_minutes = models.IntegerField()         # how long the task takes
    deadline = models.DateTimeField()                # when it must be done
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.priority}) - {self.user_type}"

    class Meta:
        ordering = ['deadline']