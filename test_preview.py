"""
Demo script to test the new Live Preview functionality
"""
import requests
import json

# Test the new preview endpoint
def test_preview_functionality():
    print("🎬 Testing Live Preview Functionality")
    print("=" * 50)
    
    # Using an existing PowerPoint file from outputs
    import os
    outputs_dir = "../backend/outputs"
    pptx_files = [f for f in os.listdir(outputs_dir) if f.endswith('.pptx')]
    
    if not pptx_files:
        print("❌ No PowerPoint files found in outputs directory")
        return
    
    test_file = os.path.join(outputs_dir, pptx_files[0])
    print(f"📁 Using test file: {pptx_files[0]}")
    
    # Test preview generation
    url = "http://localhost:8000/api/preview-edit"
    
    with open(test_file, 'rb') as f:
        files = {'file': f}
        data = {
            'edit_prompt': 'On slide 1, change the title to "Updated Presentation Title"',
            'slide_number': '1',
            'output_format': 'pptx'
        }
        
        try:
            print("\n🔍 Generating preview...")
            response = requests.post(url, files=files, data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Preview generated successfully!")
                print(f"📊 Preview data keys: {list(result.keys())}")
                
                if 'preview_data' in result:
                    preview = result['preview_data']
                    print(f"📑 Total slides: {preview.get('total_slides', 'N/A')}")
                    print(f"📝 Edit summary: {preview.get('edit_summary', [])}")
                    
                    if 'slides' in preview and preview['slides']:
                        first_slide = preview['slides'][0]
                        print(f"🎯 First slide changes: {len(first_slide.get('changes', []))}")
                        
                        for change in first_slide.get('changes', [])[:3]:  # Show first 3 changes
                            print(f"   • {change.get('description', 'No description')}")
                
            else:
                print(f"❌ Preview failed: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_preview_functionality()
