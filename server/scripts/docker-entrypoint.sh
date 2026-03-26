#!/bin/sh
set -eu

fix_sqlite_permissions() {
  db_url="${DATABASE_URL:-file:/app/data/db.sqlite}"

  case "$db_url" in
    file:*)
      db_path="${db_url#file:}"
      db_path="${db_path%%\?*}"
      db_path="${db_path%%\#*}"

      if [ -z "$db_path" ]; then
        db_path="/app/data/db.sqlite"
      fi

      case "$db_path" in
        /*) ;;
        *) db_path="/app/$db_path" ;;
      esac

      db_dir=$(dirname "$db_path")
      mkdir -p "$db_dir"

      if [ "$(id -u)" -eq 0 ]; then
        chown -R appuser:appgroup "$db_dir"
        chmod 775 "$db_dir" || true

        if [ -e "$db_path" ]; then
          chown appuser:appgroup "$db_path"
          chmod 664 "$db_path" || true
        fi

        if [ -e "${db_path}-wal" ]; then
          chown appuser:appgroup "${db_path}-wal"
          chmod 664 "${db_path}-wal" || true
        fi

        if [ -e "${db_path}-shm" ]; then
          chown appuser:appgroup "${db_path}-shm"
          chmod 664 "${db_path}-shm" || true
        fi
      fi
      ;;
  esac
}

if [ "$#" -eq 0 ]; then
  set -- node scripts/start.js
fi

fix_sqlite_permissions

if [ "$(id -u)" -eq 0 ]; then
  exec su-exec appuser "$@"
fi

exec "$@"
