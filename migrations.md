# Alembic Migrations Setup & Guide

This document details the steps that were executed to implement Alembic database migrations in the MedRecord Pro EMR System and provides a guide for managing future migrations.

## What was Executed

### 1. Initialized Alembic
We initialized Alembic within the `backend` directory using the standard CLI command:
```bash
alembic init alembic
```

### 2. Configured Alembic (`alembic/env.py`)
To allow Alembic to read our SQLAlchemy models and database connection URL, we modified `alembic/env.py`. We added the following configuration to link Alembic to our FastAPI `settings` and `Base` metadata:

```python
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.database import Base
# Imported all models so they register with Base.metadata
from app.models import patient, record, appointment, prescription

target_metadata = Base.metadata

# Dynamically set the database URL from our environment variables
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

### 3. Removed Auto-Schema Generation
Previously, the app created tables directly on startup using `Base.metadata.create_all(bind=engine)` in `main.py`. This line was removed to strictly enforce schema management through Alembic migrations.

### 4. Automated Migrations on Container Startup
To ensure the database is always up-to-date when deployed, we created an `entrypoint.sh` script for the backend Docker container:

```bash
#!/bin/sh
set -e

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting Uvicorn..."
exec "$@"
```
We made this script executable (`chmod +x entrypoint.sh`) and updated `backend/Dockerfile` to use it as the `ENTRYPOINT`.

### 5. Generated the Initial Migration
We used Docker to generate the initial migration script. Since the database must be running for Alembic to autogenerate schemas accurately by introspecting the live DB, we ran:

```bash
docker compose run --rm -v $(pwd)/backend:/app backend sh -c "alembic revision --autogenerate -m 'initial_migration'"
```
*(Note: We mounted the volume `-v $(pwd)/backend:/app` to ensure the generated migration file was saved to the host file system instead of being lost inside the temporary container).*

This successfully generated the first version script (e.g., `b061d0aabd60_initial_migration.py`) inside `backend/alembic/versions/`.

---

## How to Manage Future Migrations

Whenever you add a new SQLAlchemy model or modify an existing one (e.g., adding a new column), follow these steps to generate and apply a new migration:

### Step 1: Generate the Migration
Run the following command from the root `emr-system` directory while your database container is running. This generates the migration script.

```bash
docker compose run --rm -v $(pwd)/backend:/app backend sh -c "alembic revision --autogenerate -m 'your_descriptive_message'"
```

### Step 2: Review the Generated Script
Always review the newly generated file inside `backend/alembic/versions/`. Alembic is great, but it can sometimes misinterpret complex changes (like renaming columns vs. dropping/adding them).

### Step 3: Apply the Migration
You have two ways to apply the migration:

**Option A (Automated):** Simply restart your backend container. The `entrypoint.sh` script will automatically apply it on startup.
```bash
docker compose restart backend
```

**Option B (Manual):** Apply it immediately without restarting the container:
```bash
docker compose exec backend alembic upgrade head
```
