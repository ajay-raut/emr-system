"""Prescriptions API endpoints with PDF download."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
import io
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.patient import Patient
from app.models.prescription import Prescription, PrescriptionItem
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse
from app.schemas.pagination import PaginationParams, PaginatedResponse
from app.services.pdf_generator import generate_prescription_pdf

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.get("/", response_model=PaginatedResponse[PrescriptionResponse])
def list_prescriptions(
    pagination: PaginationParams = Depends(),
    patient_id: UUID = Query(None, description="Filter by patient ID"),
    db: Session = Depends(get_db)
):
    """List prescriptions with pagination, optionally filtered by patient."""
    query = db.query(Prescription).options(joinedload(Prescription.items))
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    
    # Get total count (without joinedload for accurate count)
    count_query = db.query(Prescription)
    if patient_id:
        count_query = count_query.filter(Prescription.patient_id == patient_id)
    total = count_query.count()
    
    # Get paginated results
    prescriptions = query.order_by(Prescription.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    
    # Convert SQLAlchemy models to Pydantic models
    prescription_responses = [PrescriptionResponse.model_validate(p) for p in prescriptions]
    
    return PaginatedResponse.create(
        items=prescription_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(prescription_id: UUID, db: Session = Depends(get_db)):
    """Get a specific prescription with its items."""
    rx = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == prescription_id)
        .first()
    )
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return rx


@router.post("/", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(rx_in: PrescriptionCreate, db: Session = Depends(get_db)):
    """Create a new prescription with medications."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == rx_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Create prescription
    rx = Prescription(
        patient_id=rx_in.patient_id,
        doctor_name=rx_in.doctor_name,
        diagnosis=rx_in.diagnosis,
        notes=rx_in.notes,
    )
    db.add(rx)
    db.flush()

    # Create prescription items
    for item_data in rx_in.items:
        item = PrescriptionItem(
            prescription_id=rx.id,
            **item_data.model_dump(),
        )
        db.add(item)

    db.commit()
    db.refresh(rx)

    # Reload with items
    rx = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == rx.id)
        .first()
    )
    return rx


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(prescription_id: UUID, rx_in: PrescriptionCreate, db: Session = Depends(get_db)):
    """Update a prescription and its medications."""
    rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Update basic fields
    rx.doctor_name = rx_in.doctor_name
    rx.diagnosis = rx_in.diagnosis
    rx.notes = rx_in.notes
    
    # Update items (delete old, add new)
    db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == rx.id).delete()
    
    for item_data in rx_in.items:
        item = PrescriptionItem(
            prescription_id=rx.id,
            **item_data.model_dump(),
        )
        db.add(item)

    db.commit()

    # Reload with items
    rx = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == rx.id)
        .first()
    )
    return rx


@router.get("/{prescription_id}/download")
def download_prescription_pdf(prescription_id: UUID, db: Session = Depends(get_db)):
    """Generate and download a prescription as a PDF document."""
    # Fetch prescription with items
    rx = (
        db.query(Prescription)
        .options(joinedload(Prescription.items))
        .filter(Prescription.id == prescription_id)
        .first()
    )
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Fetch patient
    patient = db.query(Patient).filter(Patient.id == rx.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Prepare data for PDF
    patient_data = {
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender.value if hasattr(patient.gender, "value") else str(patient.gender),
        "phone": patient.phone,
        "blood_group": patient.blood_group.value if patient.blood_group and hasattr(patient.blood_group, "value") else str(patient.blood_group) if patient.blood_group else None,
    }

    prescription_data = {
        "doctor_name": rx.doctor_name,
        "diagnosis": rx.diagnosis,
        "notes": rx.notes,
        "created_at": rx.created_at,
    }

    items = [
        {
            "medication_name": item.medication_name,
            "dosage": item.dosage,
            "frequency": item.frequency,
            "duration": item.duration,
            "instructions": item.instructions,
        }
        for item in rx.items
    ]

    # Generate PDF
    pdf_bytes = generate_prescription_pdf(patient_data, prescription_data, items)

    filename = f"prescription_{patient.last_name}_{rx.created_at.strftime('%Y%m%d')}.pdf"

    # Wrap bytearray in bytes and stream via io.BytesIO
    return StreamingResponse(
        io.BytesIO(bytes(pdf_bytes)),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription(prescription_id: UUID, db: Session = Depends(get_db)):
    """Delete a prescription."""
    rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    db.delete(rx)
    db.commit()
    return None
