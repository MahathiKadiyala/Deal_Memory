import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.user import User
from app.models.stakeholder import Stakeholder
from app.models.account import Account
from app.models.deal import Deal

def main():
    db = SessionLocal()
    try:
        print("=== USERS IN DATABASE ===")
        users = db.execute(select(User)).scalars().all()
        for u in users:
            print(f"User: id={u.id}, email={u.email}, name={u.name}")

        print("\n=== STAKEHOLDERS IN DATABASE ===")
        stakeholders = db.execute(select(Stakeholder)).scalars().all()
        for s in stakeholders:
            print(f"Stakeholder: id={s.id}, name={s.name}, role={s.role}, email={s.email}, account_id={s.account_id}")

        print("\n=== ACCOUNTS IN DATABASE ===")
        accounts = db.execute(select(Account)).scalars().all()
        for a in accounts:
            print(f"Account: id={a.id}, name={a.name}, owner_user_id={a.owner_user_id}")

        print("\n=== DEALS IN DATABASE ===")
        deals = db.execute(select(Deal)).scalars().all()
        for d in deals:
            print(f"Deal: id={d.id}, name={d.name}, owner_user_id={d.owner_user_id}, account_id={d.account_id}")

        # Check specifically if Sarah Chen is in users table
        sarah_chen_user = db.execute(select(User).where(User.name.ilike("%Sarah Chen%"))).scalar_one_or_none()
        print(f"\nIs 'Sarah Chen' in users table? {sarah_chen_user is not None}")

        # Check specifically if Sarah Chen is in stakeholders table
        sarah_chen_stakeholder = db.execute(select(Stakeholder).where(Stakeholder.name.ilike("%Sarah Chen%"))).scalar_one_or_none()
        print(f"Is 'Sarah Chen' in stakeholders table? {sarah_chen_stakeholder is not None}")
        if sarah_chen_stakeholder:
            print(f"Sarah Chen stakeholder account: {sarah_chen_stakeholder.account_id}")

    finally:
        db.close()

if __name__ == "__main__":
    main()
