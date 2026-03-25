import argparse
from sqlalchemy import create_engine, text


def normalize_postgres_url(url: str) -> str:
    if url.startswith("postgresql://") and "+" not in url.split("://", 1)[0]:
        return url.replace("postgresql://", "postgresql+pg8000://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+pg8000://", 1)
    return url


def safe_count(conn, table_name: str) -> int:
    try:
        result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        return int(result.scalar() or 0)
    except Exception:
        return -1


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect row counts in a Postgres database URL")
    parser.add_argument("--url", required=True, help="Postgres database URL (Render External URL)")
    args = parser.parse_args()

    db_url = normalize_postgres_url(args.url.strip())
    engine = create_engine(db_url, pool_pre_ping=True)

    with engine.connect() as conn:
        users = safe_count(conn, "users")
        students = safe_count(conn, "students")
        courses = safe_count(conn, "courses")
        enrollments = safe_count(conn, "enrollments")

    print("users:", users)
    print("students:", students)
    print("courses:", courses)
    print("enrollments:", enrollments)


if __name__ == "__main__":
    main()
