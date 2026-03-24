from datetime import datetime, timedelta, timezone


def greedy_scheduler(tasks):
    PRIORITY_ORDER = {'high': 1, 'medium': 2, 'low': 3}

    sorted_tasks = sorted(
        tasks,
        key=lambda t: (
            t.deadline,
            PRIORITY_ORDER.get(t.priority.lower(), 99)
        )
    )

    scheduled = []

    current_time = datetime.now(timezone.utc).replace(
        hour=8, minute=0, second=0, microsecond=0
    )

    for task in sorted_tasks:
        start_time = current_time
        end_time = start_time + timedelta(minutes=task.duration_minutes)

        end_of_day = start_time.replace(hour=22, minute=0, second=0)
        if end_time > end_of_day:
            next_day = (start_time + timedelta(days=1)).replace(
                hour=8, minute=0, second=0
            )
            start_time = next_day
            end_time = start_time + timedelta(minutes=task.duration_minutes)

        status = 'scheduled' if end_time <= task.deadline else 'at_risk'

        scheduled.append({
            'id': task.id,
            'title': task.title,
            'priority': task.priority,
            'duration_minutes': task.duration_minutes,
            'deadline': task.deadline,
            'user_type': task.user_type,
            'start_time': start_time,
            'end_time': end_time,
            'status': status,
        })

        current_time = end_time

    return scheduled