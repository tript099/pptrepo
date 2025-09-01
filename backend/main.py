from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import tempfile
import zipfile
import csv
import io
import json
import shutil
from typing import List, Optional
from datetime import datetime
import uvicorn

from services.ai_service import AIService
from services.ppt_service import PPTService
from services.pdf_service import PDFService

app = FastAPI(title="AI-Powered PPT Automation System", version="1.0.0")

# Define allowed origins for CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://localhost:3002",
    "https://pptrepo.vercel.app",
    "https://pptrepo-git-main-tript099s-projects.vercel.app",  # Git branch deployments
    "https://pptrepo-tript099s-projects.vercel.app",  # Project deployments
]

# Add frontend URL from environment if specified
FRONTEND_URL = os.getenv("FRONTEND_URL")
if FRONTEND_URL and FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Ensure outputs directory exists
os.makedirs("outputs", exist_ok=True)

# Initialize services
ai_service = AIService()
ppt_service = PPTService()
pdf_service = PDFService()

class GenerateRequest(BaseModel):
    prompt: str
    output_format: Optional[str] = "pptx"  # "pptx" or "pdf"

class EditRequest(BaseModel):
    updates: dict
    output_format: Optional[str] = "pptx"

class PromptEditRequest(BaseModel):
    edit_prompt: str
    slide_number: Optional[int] = None
    output_format: Optional[str] = "pptx"

@app.get("/")
async def root():
    return {"message": "AI-Powered PPT Automation System API"}

@app.post("/generate")
async def generate_presentation(
    prompt: str = Form(...),
    output_format: str = Form("pptx"),
    template: UploadFile = File(None),
    logo: UploadFile = File(None),
    logo_position: str = Form("top-right"),
    logo_size: str = Form("medium")
):
    """Generate a PowerPoint presentation from a text prompt with optional template and logo"""
    try:
        print(f"Received request: {prompt[:100]}...")
        
        # Handle template upload
        template_path = None
        if template:
            print(f"Template uploaded: {template.filename}")
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as temp_file:
                content = await template.read()
                temp_file.write(content)
                template_path = temp_file.name
        
        # Handle logo upload
        logo_path = None
        if logo:
            print(f"Logo uploaded: {logo.filename}")
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{logo.filename.split('.')[-1]}") as temp_file:
                content = await logo.read()
                temp_file.write(content)
                logo_path = temp_file.name
        
        # Get structured data from AI
        print("Calling AI service...")
        slide_data = await ai_service.generate_slide_structure(prompt)
        print(f"AI service returned: {len(slide_data.get('slides', []))} slides")
        
        # Generate PPTX file
        print("Creating presentation...")
        pptx_path = ppt_service.create_presentation_with_full_template(
            slide_data, 
            template_path=template_path,
            logo_path=logo_path,
            logo_position=logo_position,
            logo_size=logo_size
        )
        print(f"Presentation created at: {pptx_path}")
        
        # Clean up temporary files
        if template_path:
            os.unlink(template_path)
        if logo_path:
            os.unlink(logo_path)
        
        if output_format == "pdf":
            # Convert to PDF
            pdf_path = pdf_service.convert_to_pdf(pptx_path)
            filename = f"{slide_data['meta']['deck_title'].replace(' ', '_')}.pdf"
            return FileResponse(
                pdf_path, 
                media_type="application/pdf",
                filename=filename,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            # Return PPTX
            filename = f"{slide_data['meta']['deck_title'].replace(' ', '_')}.pptx"
            return FileResponse(
                pptx_path, 
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                filename=filename,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
            
    except Exception as e:
        print(f"Error in generate_presentation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-structure")
async def generate_slide_structure(request: GenerateRequest):
    """Generate slide structure JSON without creating presentation file"""
    try:
        print(f"Generating structure for: {request.prompt[:100]}...")
        
        # Get structured data from AI
        slide_data = await ai_service.generate_slide_structure(request.prompt)
        print(f"Generated structure with {len(slide_data.get('slides', []))} slides")
        
        return slide_data
            
    except Exception as e:
        print(f"Error in generate_slide_structure: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-from-structure")
async def generate_from_structure(
    slide_data: str = Form(...),
    output_format: str = Form("pptx"),
    template: UploadFile = File(None),
    logo: UploadFile = File(None),
    logo_position: str = Form("top-right"),
    logo_size: str = Form("medium")
):
    """Generate presentation from edited slide structure"""
    try:
        print("Generating presentation from edited structure...")
        
        # Parse slide data
        slide_structure = json.loads(slide_data)
        print(f"Parsed structure with {len(slide_structure.get('slides', []))} slides")
        
        # Handle template upload
        template_path = None
        if template:
            print(f"Template uploaded: {template.filename}")
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as temp_file:
                content = await template.read()
                temp_file.write(content)
                template_path = temp_file.name
        
        # Handle logo upload
        logo_path = None
        if logo:
            print(f"Logo uploaded: {logo.filename}")
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{logo.filename.split('.')[-1]}") as temp_file:
                content = await logo.read()
                temp_file.write(content)
                logo_path = temp_file.name
        
        # Check if slide structure has original template info
        stored_template_path = None
        if slide_structure.get("meta", {}).get("stored_template_path"):
            stored_template_path = slide_structure["meta"]["stored_template_path"]
            if os.path.exists(stored_template_path):
                print(f"Using stored original template: {stored_template_path}")
                template_path = stored_template_path
            else:
                print(f"Warning: Stored template not found: {stored_template_path}")
        
        # Generate PPTX file
        print("Creating presentation from structure...")
        pptx_path = ppt_service.create_presentation_with_full_template(
            slide_structure, 
            template_path=template_path,
            logo_path=logo_path,
            logo_position=logo_position,
            logo_size=logo_size
        )
        print(f"Presentation created at: {pptx_path}")
        
        # Clean up temporary files
        if template_path:
            os.unlink(template_path)
        if logo_path:
            os.unlink(logo_path)
        
        if output_format == "pdf":
            # Convert to PDF
            pdf_path = pdf_service.convert_to_pdf(pptx_path)
            filename = f"{slide_structure['meta']['deck_title'].replace(' ', '_')}.pdf"
            return FileResponse(
                pdf_path, 
                media_type="application/pdf",
                filename=filename,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            # Return PPTX
            filename = f"{slide_structure['meta']['deck_title'].replace(' ', '_')}.pptx"
            return FileResponse(
                pptx_path, 
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                filename=filename,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
            
    except Exception as e:
        print(f"Error in generate_from_structure: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/preview")
async def preview_presentation(slide_data: dict):
    """Generate a preview of the presentation"""
    try:
        print("Generating preview...")
        
        # Generate PPTX file for preview
        pptx_path = ppt_service.create_presentation_with_full_template(slide_data)
        
        filename = f"preview_{slide_data['meta']['deck_title'].replace(' ', '_')}.pptx"
        return FileResponse(
            pptx_path, 
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
            
    except Exception as e:
        print(f"Error in preview_presentation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-from-ppt")
async def extract_from_ppt(ppt_file: UploadFile = File(...)):
    """
    Extract slide data from an uploaded PowerPoint file for editing
    """
    try:
        print(f"Received PPT file for extraction: {ppt_file.filename}")
        
        if not ppt_file.filename.lower().endswith(('.ppt', '.pptx')):
            raise HTTPException(status_code=400, detail="File must be a PowerPoint presentation (.ppt or .pptx)")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as temp_file:
            content = await ppt_file.read()
            temp_file.write(content)
            temp_ppt_path = temp_file.name
        
        try:
            # Extract slide data from the uploaded presentation
            slide_data = ppt_service.extract_slide_data_from_ppt(temp_ppt_path)
            print(f"Successfully extracted {len(slide_data.get('slides', []))} slides from uploaded PPT")
            
            # Save the original template file for later use
            template_storage_path = os.path.join("outputs", f"template_{int(datetime.now().timestamp())}.pptx")
            os.makedirs("outputs", exist_ok=True)
            shutil.copy2(temp_ppt_path, template_storage_path)
            
            # Update the slide data with the stored template path
            slide_data["meta"]["stored_template_path"] = template_storage_path
            print(f"Saved original template to: {template_storage_path}")
            
            return {
                "success": True,
                "slide_data": slide_data,
                "original_filename": ppt_file.filename,
                "message": f"Successfully extracted {len(slide_data.get('slides', []))} slides for editing"
            }
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_ppt_path)
            except:
                pass
        
    except Exception as e:
        print(f"Error in extract_from_ppt: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PPT extraction failed: {str(e)}")

@app.post("/edit")
async def edit_presentation(file: UploadFile = File(...), updates: str = ""):
    """Edit an existing PowerPoint presentation"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Parse updates JSON
        import json
        updates_dict = json.loads(updates) if updates else {}
        
        # Apply edits
        edited_path = ppt_service.edit_presentation(temp_path, updates_dict)
        
        return FileResponse(
            edited_path,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            filename="edited_presentation.pptx"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if 'temp_path' in locals():
            os.unlink(temp_path)

@app.post("/edit-with-prompt")
async def edit_presentation_with_prompt(
    file: UploadFile = File(...),
    edit_prompt: str = Form(...),
    slide_number: Optional[int] = Form(None),
    output_format: str = Form("pptx")
):
    """Edit an existing PowerPoint presentation using natural language prompts"""
    try:
        print(f"🎯 Editing presentation with prompt: {edit_prompt}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Extract current slide data from the presentation
        print("📋 Extracting current presentation structure...")
        current_slide_data = ppt_service.extract_slide_data_from_ppt(temp_path)
        
        # Use AI to generate edit instructions
        print("🤖 Generating AI edit instructions...")
        edit_instructions = await ai_service.generate_slide_edits(
            edit_prompt, 
            current_slide_data, 
            slide_number
        )
        
        print(f"📝 Generated edit instructions: {edit_instructions}")
        
        # Apply the AI-generated edits
        print("🔧 Applying edits to presentation...")
        edited_path = ppt_service.edit_presentation(temp_path, edit_instructions)
        
        # Handle output format
        if output_format == "pdf":
            # Convert to PDF
            pdf_path = pdf_service.convert_to_pdf(edited_path)
            filename = f"edited_presentation.pdf"
            return FileResponse(
                pdf_path, 
                media_type="application/pdf",
                filename=filename,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            # Return PPTX
            filename = f"edited_presentation.pptx"
            return FileResponse(
                edited_path,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                filename=filename,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
    except Exception as e:
        print(f"Error in edit_presentation_with_prompt: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if 'temp_path' in locals():
            os.unlink(temp_path)

@app.post("/preview-edit")
async def preview_edit_with_prompt(
    file: UploadFile = File(...),
    edit_prompt: str = Form(...),
    slide_number: Optional[int] = Form(None),
    output_format: str = Form("pptx")
):
    """Preview presentation edits without downloading the file"""
    try:
        # Save uploaded file temporarily
        temp_path = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract current slide content before editing
        original_slides = ppt_service.extract_slide_content(temp_path)
        
        # Generate edit instructions using AI
        edit_instructions = await ai_service.generate_slide_edits(
            edit_prompt, 
            slide_number, 
            original_slides
        )
        
        # Apply edits and get preview data
        preview_data = ppt_service.preview_edits(
            temp_path, 
            edit_instructions, 
            slide_number
        )
        
        return {
            "success": True,
            "original_slides": original_slides,
            "edit_instructions": edit_instructions,
            "preview_data": preview_data,
            "message": "Preview generated successfully"
        }
        
    except Exception as e:
        print(f"Error in preview_edit_with_prompt: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if 'temp_path' in locals():
            os.unlink(temp_path)

@app.post("/apply-preview-edits")
async def apply_preview_edits(
    file: UploadFile = File(...),
    edit_instructions: str = Form(...),
    slide_number: Optional[int] = Form(None),
    output_format: str = Form("pptx")
):
    """Apply the previewed edits and download the file"""
    try:
        # Save uploaded file temporarily
        temp_path = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Parse edit instructions
        instructions = json.loads(edit_instructions)
        
        # Apply edits
        output_path = ppt_service.edit_presentation(
            temp_path, 
            instructions
        )
        
        return FileResponse(
            output_path,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation" if output_format == "pptx" else "application/pdf",
            filename=os.path.basename(output_path)
        )
        
    except Exception as e:
        print(f"Error in apply_preview_edits: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if 'temp_path' in locals():
            os.unlink(temp_path)

@app.post("/bulk")
async def bulk_generate(file: UploadFile = File(...)):
    """Generate multiple presentations from CSV data"""
    try:
        # Read CSV file
        content = await file.read()
        csv_data = csv.DictReader(io.StringIO(content.decode('utf-8')))
        
        # Create temporary directory for generated files
        with tempfile.TemporaryDirectory() as temp_dir:
            generated_files = []
            
            for i, row in enumerate(csv_data):
                # Construct prompt from CSV row
                prompt = row.get('prompt', '') or f"Create presentation for: {', '.join(row.values())}"
                
                # Generate slide structure
                slide_data = await ai_service.generate_slide_structure(prompt)
                
                # Create presentation
                pptx_path = ppt_service.create_presentation_with_full_template(slide_data, output_dir=temp_dir)
                generated_files.append(pptx_path)
            
            # Create ZIP file
            zip_path = os.path.join("outputs", "bulk_presentations.zip")
            with zipfile.ZipFile(zip_path, 'w') as zip_file:
                for file_path in generated_files:
                    zip_file.write(file_path, os.path.basename(file_path))
            
            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename="bulk_presentations.zip"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 