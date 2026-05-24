"""
PDF Prescription Generator using FPDF2.
Generates professional-looking prescription documents with clinic header,
patient details, and medication table.
"""
import io
from datetime import datetime
from fpdf import FPDF


class PrescriptionPDF(FPDF):
    """Custom FPDF class for prescription generation."""

    CLINIC_NAME = "MedRecord Pro Clinic"
    CLINIC_ADDRESS = "123 Healthcare Avenue, Medical District"
    CLINIC_PHONE = "+1 (555) 123-4567"
    CLINIC_EMAIL = "care@medrecordpro.com"

    def header(self):
        # Top accent bar
        self.set_fill_color(37, 99, 235)  # Blue-600
        self.rect(0, 0, 210, 3, "F")

        # Clinic Name
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(37, 99, 235)
        self.set_y(10)
        self.cell(0, 10, self.CLINIC_NAME, ln=True, align="C")

        # Clinic details
        self.set_font("Helvetica", "", 9)
        self.set_text_color(107, 114, 128)
        self.cell(0, 5, f"{self.CLINIC_ADDRESS} | {self.CLINIC_PHONE} | {self.CLINIC_EMAIL}", ln=True, align="C")

        # Divider line
        self.set_y(30)
        self.set_draw_color(229, 231, 235)
        self.set_line_width(0.5)
        self.line(10, 30, 200, 30)

        # PRESCRIPTION title
        self.set_y(34)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(17, 24, 39)
        self.cell(0, 8, "PRESCRIPTION", ln=True, align="C")
        self.ln(2)

    def footer(self):
        self.set_y(-30)
        # Divider
        self.set_draw_color(229, 231, 235)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

        # Signature area
        self.set_font("Helvetica", "", 9)
        self.set_text_color(107, 114, 128)
        self.cell(95, 5, f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", align="L")
        self.cell(95, 5, "Authorized Signature: ____________________", align="R", ln=True)

        # Footer bar
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(156, 163, 175)
        self.cell(0, 5, "This is a computer-generated prescription. Please consult your doctor for clarifications.", align="C", ln=True)
        self.cell(0, 5, f"Page {self.page_no()}/{{nb}}", align="C")


def generate_prescription_pdf(patient_data: dict, prescription_data: dict, items: list[dict]) -> bytes:
    """
    Generate a professional prescription PDF.

    Args:
        patient_data: dict with patient info (first_name, last_name, dob, gender, phone, blood_group)
        prescription_data: dict with prescription info (doctor_name, diagnosis, notes, created_at)
        items: list of dicts with medication info (medication_name, dosage, frequency, duration, instructions)

    Returns:
        PDF as bytes
    """
    pdf = PrescriptionPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=35)

    y_start = 46

    # ── Patient Information Card ──
    pdf.set_y(y_start)
    pdf.set_fill_color(249, 250, 251)  # gray-50
    pdf.set_draw_color(229, 231, 235)
    pdf.rect(10, y_start, 190, 32, "DF")

    pdf.set_y(y_start + 2)
    pdf.set_x(14)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(37, 99, 235)
    pdf.cell(0, 6, "PATIENT INFORMATION", ln=True)

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(55, 65, 81)

    # Row 1
    pdf.set_x(14)
    full_name = f"{patient_data.get('first_name', '')} {patient_data.get('last_name', '')}"
    pdf.cell(60, 6, f"Name: {full_name}", ln=False)
    dob = patient_data.get("date_of_birth", "N/A")
    if hasattr(dob, "strftime"):
        dob = dob.strftime("%B %d, %Y")
    pdf.cell(60, 6, f"Date of Birth: {dob}", ln=False)
    pdf.cell(60, 6, f"Gender: {patient_data.get('gender', 'N/A')}", ln=True)

    # Row 2
    pdf.set_x(14)
    pdf.cell(60, 6, f"Phone: {patient_data.get('phone', 'N/A')}", ln=False)
    pdf.cell(60, 6, f"Blood Group: {patient_data.get('blood_group', 'N/A') or 'N/A'}", ln=False)
    rx_date = prescription_data.get("created_at", datetime.now())
    if hasattr(rx_date, "strftime"):
        rx_date = rx_date.strftime("%B %d, %Y")
    pdf.cell(60, 6, f"Rx Date: {rx_date}", ln=True)

    # Row 3 — Doctor & Diagnosis
    pdf.set_x(14)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(60, 6, f"Prescribing Doctor: {prescription_data.get('doctor_name', 'N/A')}", ln=False)
    pdf.set_font("Helvetica", "", 9)
    diagnosis = prescription_data.get("diagnosis", "")
    if diagnosis:
        pdf.cell(120, 6, f"Diagnosis: {diagnosis}", ln=True)
    else:
        pdf.ln(6)

    # ── Medications Table ──
    table_y = y_start + 38
    pdf.set_y(table_y)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(37, 99, 235)
    pdf.set_x(10)
    pdf.cell(0, 8, "PRESCRIBED MEDICATIONS", ln=True)

    # Table header
    pdf.set_fill_color(37, 99, 235)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 8)

    col_widths = [8, 52, 28, 32, 25, 45]
    headers = ["#", "Medication", "Dosage", "Frequency", "Duration", "Instructions"]

    pdf.set_x(10)
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 8, header, border=1, fill=True, align="C")
    pdf.ln()

    # Table rows
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(55, 65, 81)

    for idx, item in enumerate(items, 1):
        # Alternate row colors
        if idx % 2 == 0:
            pdf.set_fill_color(249, 250, 251)
        else:
            pdf.set_fill_color(255, 255, 255)

        row_data = [
            str(idx),
            item.get("medication_name", ""),
            item.get("dosage", ""),
            item.get("frequency", ""),
            item.get("duration", ""),
            item.get("instructions", "") or "—",
        ]

        pdf.set_x(10)
        for i, data in enumerate(row_data):
            align = "C" if i == 0 else "L"
            pdf.cell(col_widths[i], 7, data[:30] if len(data) > 30 else data, border=1, fill=True, align=align)
        pdf.ln()

    # ── Notes Section ──
    notes = prescription_data.get("notes", "")
    if notes:
        pdf.ln(6)
        pdf.set_x(10)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(37, 99, 235)
        pdf.cell(0, 6, "ADDITIONAL NOTES", ln=True)
        pdf.set_x(10)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(55, 65, 81)
        pdf.multi_cell(190, 5, notes)

    # Return as bytes
    return pdf.output()
