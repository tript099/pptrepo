import os
import subprocess
import platform
from typing import Optional

class PDFService:
    def __init__(self):
        self.output_dir = "outputs"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def convert_to_pdf(self, pptx_path: str, output_path: Optional[str] = None) -> str:
        """
        Convert a PowerPoint file to PDF
        """
        if not output_path:
            # Generate PDF filename
            base_name = os.path.splitext(os.path.basename(pptx_path))[0]
            output_path = os.path.join(self.output_dir, f"{base_name}.pdf")
        
        try:
            # Try LibreOffice first (cross-platform)
            if self._convert_with_libreoffice(pptx_path, output_path):
                return output_path
            
            # Fallback to platform-specific methods
            if platform.system() == "Windows":
                if self._convert_with_windows_com(pptx_path, output_path):
                    return output_path
            
            # If all methods fail, raise an exception
            raise Exception("No PDF conversion method available")
            
        except Exception as e:
            print(f"PDF conversion failed: {e}")
            # Return the original PPTX path as fallback
            return pptx_path
    
    def _convert_with_libreoffice(self, pptx_path: str, output_path: str) -> bool:
        """
        Convert using LibreOffice headless mode
        """
        try:
            # Get output directory
            output_dir = os.path.dirname(output_path)
            
            # LibreOffice command
            cmd = [
                "libreoffice",
                "--headless",
                "--convert-to", "pdf",
                "--outdir", output_dir,
                pptx_path
            ]
            
            # Run conversion
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                # LibreOffice creates PDF with same name as input file
                generated_pdf = os.path.join(output_dir, 
                    os.path.splitext(os.path.basename(pptx_path))[0] + ".pdf")
                
                # Rename to desired output path if different
                if generated_pdf != output_path and os.path.exists(generated_pdf):
                    os.rename(generated_pdf, output_path)
                
                return os.path.exists(output_path)
            
            return False
            
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
            return False
    
    def _convert_with_windows_com(self, pptx_path: str, output_path: str) -> bool:
        """
        Convert using Windows COM automation (PowerPoint)
        """
        try:
            import win32com.client
            
            # Create PowerPoint application
            ppt_app = win32com.client.Dispatch("PowerPoint.Application")
            ppt_app.Visible = False
            
            # Open presentation
            presentation = ppt_app.Presentations.Open(os.path.abspath(pptx_path))
            
            # Export as PDF (32 = ppSaveAsPDF)
            presentation.ExportAsFixedFormat(os.path.abspath(output_path), 32)
            
            # Close and cleanup
            presentation.Close()
            ppt_app.Quit()
            
            return os.path.exists(output_path)
            
        except ImportError:
            # pywin32 not available
            return False
        except Exception:
            return False
    
    def _convert_with_aspose(self, pptx_path: str, output_path: str) -> bool:
        """
        Convert using Aspose.Slides (if available)
        """
        try:
            import aspose.slides as slides
            
            # Load presentation
            presentation = slides.Presentation(pptx_path)
            
            # Save as PDF
            presentation.save(output_path, slides.export.SaveFormat.PDF)
            
            return os.path.exists(output_path)
            
        except ImportError:
            # Aspose not available
            return False
        except Exception:
            return False 