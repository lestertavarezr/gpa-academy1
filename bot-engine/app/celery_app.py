import os

from celery import Celery

BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
TICK_SECONDS = float(os.getenv("PAPER_BOT_TICK_SECONDS", "60"))

celery_app = Celery("tradinghub_bot_engine", broker=BROKER_URL, backend=BROKER_URL)

celery_app.conf.timezone = "UTC"
celery_app.conf.beat_schedule = {
    "evaluate-due-paper-bots": {
        "task": "app.paper_trading.tasks.evaluate_due_bots",
        "schedule": TICK_SECONDS,
    },
}

# Import explicito (no autodiscover_tasks): autodiscover registra las tareas
# de forma perezosa recien al finalizar la app (tipicamente al arrancar el
# worker via CLI), lo que las deja invisibles si algo importa celery_app
# directamente. Importar el modulo aca garantiza que la tarea quede
# registrada apenas se importa este archivo, sin importar como se cargue.
from app.paper_trading import tasks  # noqa: E402,F401
