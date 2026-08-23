from datetime import datetime, timedelta, timezone

from app.celery_app import celery_app
from app.paper_trading.database import SessionLocal
from app.paper_trading.engine import evaluate_bot
from app.paper_trading.models import BotStatus, PaperBot


@celery_app.task(name="app.paper_trading.tasks.evaluate_due_bots")
def evaluate_due_bots() -> int:
    """Tick de Celery Beat: revisa TODOS los bots activos y evalua solo los
    que ya vencieron su propio intervalo (evaluation_interval_minutes), asi
    cada bot puede tener un intervalo configurable distinto sin necesitar un
    scheduler dinamico por bot."""
    db = SessionLocal()
    evaluated = 0
    try:
        now = datetime.now(timezone.utc)
        active_bots = db.query(PaperBot).filter(PaperBot.status == BotStatus.ACTIVE).all()

        for bot in active_bots:
            is_due = bot.last_evaluated_at is None or (
                now - bot.last_evaluated_at >= timedelta(minutes=bot.evaluation_interval_minutes)
            )
            if is_due:
                evaluate_bot(db, bot)
                evaluated += 1
    finally:
        db.close()

    return evaluated
