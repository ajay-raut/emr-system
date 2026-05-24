# EMR System

A comprehensive Electronic Medical Record (EMR) system built with a modern web stack, featuring a React frontend, FastAPI backend, and PostgreSQL database. The entire application is containerized using Docker and orchestrated with Docker Compose.

## 🚀 Tech Stack

### Frontend
* **Framework:** React 18 with Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Icons:** Lucide React

### Backend
* **Framework:** FastAPI (Python)
* **Server:** Uvicorn
* **ORM:** SQLAlchemy 2.0
* **Data Validation:** Pydantic
* **Database Migrations:** Alembic
* **Authentication:** JWT (python-jose, bcrypt)
* **PDF Generation:** fpdf2

### Infrastructure & Database
* **Database:** PostgreSQL 15
* **Database Management:** Adminer
* **Containerization:** Docker & Docker Compose
* **Web Server:** Nginx (for serving the frontend)

## 🏗️ Project Architecture

```mermaid
graph TD
    Client[Web Browser] -->|HTTP Requests| Frontend[React / Nginx]
    Client -->|API Calls| Backend[FastAPI Backend]
    Frontend -.->|Builds & Serves| Client
    Backend -->|SQLAlchemy ORM| Database[(PostgreSQL)]
    Backend -.->|PDF Generation| fpdf2[PDF Engine]
    Adminer[Adminer DB GUI] -->|Database Access| Database
```

## 🗄️ Database Architecture (ER Diagram)

```mermaid
erDiagram
    users {
        UUID id PK
        string username
        string hashed_password
        string security_question
        string hashed_security_answer
        datetime created_at
    }

    doctors {
        UUID id PK
        string full_name
        string specialization
        string email
        string phone
        datetime created_at
    }

    patients {
        UUID id PK
        string first_name
        string last_name
        date date_of_birth
        enum gender
        enum blood_group
        string email
        string phone
        string address
        string emergency_contact
        datetime created_at
        datetime updated_at
    }

    appointments {
        UUID id PK
        UUID patient_id FK
        datetime appointment_date
        string reason
        enum status
        string doctor_name
        string notes
        datetime created_at
    }

    medical_records {
        UUID id PK
        UUID patient_id FK
        string diagnosis
        string treatment
        datetime date
    }

    prescriptions {
        UUID id PK
        UUID patient_id FK
        datetime created_at
    }

    prescription_items {
        UUID id PK
        UUID prescription_id FK
        string medication_name
        string dosage
        string frequency
        int duration_days
    }

    patients ||--o{ appointments : "has"
    patients ||--o{ medical_records : "has"
    patients ||--o{ prescriptions : "has"
    prescriptions ||--o{ prescription_items : "contains"
```

*(Note: The `medical_records`, `prescriptions`, and `prescription_items` tables contain more detailed clinical fields in the actual implementation.)*

## 🐳 Docker Compose Architecture

The application is orchestrated using Docker Compose with the following services:

1. **`db` (PostgreSQL 15):** The core relational database storing all system data. Uses a mapped volume (`pgdata`) to persist data across container restarts.
2. **`adminer`:** A lightweight database management interface running on port `8081`. Allows for easy visual inspection and manipulation of the PostgreSQL database.
3. **`backend`:** The FastAPI application running on port `8000`. It depends on the `db` service and waits for it to be healthy before starting. Connects to the database using environment variables defined in `.env`.
4. **`frontend`:** The React application built and served by Nginx on port `80`. It depends on the `backend` service being up.

```mermaid
graph LR
    subgraph Docker Compose Network [emr-network]
        FE(frontend :80)
        BE(backend :8000)
        DB[(db :5432)]
        ADM(adminer :8081)
    end
    
    FE -->|API Requests| BE
    BE -->|SQL/TCP| DB
    ADM -->|SQL/TCP| DB
```

## ⚙️ How to Run

1. **Prerequisites:** Ensure you have Docker and Docker Compose installed on your machine.
2. **Environment Variables:** Create a `.env` file in the root directory (or use the existing one) with the necessary database and backend configurations.
3. **Start the System:**
   ```bash
   docker-compose up -d --build
   ```
4. **Access the Services:**
   * **Frontend:** `http://localhost` (or `http://localhost:80`)
   * **Backend API Docs (Swagger UI):** `http://localhost:8000/docs`
   * **Database Management (Adminer):** `http://localhost:8081`

To stop the services, run:
```bash
docker-compose down
```
