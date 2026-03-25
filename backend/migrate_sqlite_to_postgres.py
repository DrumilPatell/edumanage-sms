import argparse
import os
from pathlib import Path

from sqlalchemy import MetaData, create_engine, select, text
from sqlalchemy.orm import Session

from app.db import models


def normalize_postgres_url(url: str) -> str:
    if url.startswith("postgresql://") and "+" not in url.split("://", 1)[0]:
        return url.replace("postgresql://", "postgresql+pg8000://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+pg8000://", 1)
    return url


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate data from local SQLite DB to target PostgreSQL DB."
    )
    parser.add_argument(
        "--source",
        default="edumanage_dev.db",
        help="Path to SQLite source DB file (default: edumanage_dev.db)",
    )
    parser.add_argument(
        "--target",
        default=os.getenv("DATABASE_URL", ""),
        help="Target PostgreSQL DATABASE_URL. Defaults to env DATABASE_URL.",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing target table data before import.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only print row counts that would be migrated.",
    )
    return parser.parse_args()


def ensure_source_path(path_str: str) -> Path:
    source_path = Path(path_str)
    if not source_path.is_absolute():
        source_path = Path(__file__).resolve().parent / source_path
    if not source_path.exists():
        raise FileNotFoundError(f"SQLite source DB not found: {source_path}")
    return source_path


def reset_sequence(session: Session, table_name: str, column_name: str) -> None:
    safe_table = table_name.replace('"', "")
    safe_col = column_name.replace('"', "")

    query = text(
        f"""
        SELECT setval(
            pg_get_serial_sequence('{safe_table}', '{safe_col}'),
            COALESCE((SELECT MAX({safe_col}) FROM {safe_table}), 1),
            (SELECT MAX({safe_col}) IS NOT NULL FROM {safe_table})
        )
        """
    )
    session.execute(query)


def main() -> None:
    args = parse_args()

    if not args.target:
        raise ValueError("Target DATABASE_URL is required (via --target or env DATABASE_URL).")

    source_path = ensure_source_path(args.source)
    target_url = normalize_postgres_url(args.target)

    source_engine = create_engine(f"sqlite:///{source_path.as_posix()}")
    target_engine = create_engine(target_url, pool_pre_ping=True)

    models.Base.metadata.create_all(bind=target_engine)

    source_meta = MetaData()
    source_meta.reflect(bind=source_engine)

    target_table_order = [table.name for table in models.Base.metadata.sorted_tables]

    with source_engine.connect() as source_conn, Session(target_engine) as target_session:
        migrated_total = 0

        for table_name in target_table_order:
            if table_name not in source_meta.tables:
                continue

            source_table = source_meta.tables[table_name]
            target_table = models.Base.metadata.tables[table_name]

            rows = list(source_conn.execute(select(source_table)).mappings())
            row_count = len(rows)

            if row_count == 0:
                print(f"[SKIP] {table_name}: 0 rows")
                continue

            print(f"[INFO] {table_name}: {row_count} rows found in source")

            if args.dry_run:
                migrated_total += row_count
                continue

            if args.replace:
                target_session.execute(target_table.delete())
                print(f"[INFO] {table_name}: cleared target rows")

            target_session.execute(target_table.insert(), [dict(row) for row in rows])
            migrated_total += row_count

            pk_columns = list(target_table.primary_key.columns)
            if len(pk_columns) == 1 and str(pk_columns[0].type).lower().startswith(("integer", "bigint")):
                reset_sequence(target_session, table_name, pk_columns[0].name)

        if args.dry_run:
            print(f"[DONE] Dry run complete. Rows eligible for migration: {migrated_total}")
            return

        target_session.commit()
        print(f"[DONE] Migration complete. Rows migrated: {migrated_total}")


if __name__ == "__main__":
    main()
