#!/usr/bin/env python3
"""
Test the improved editing with specific slide 5 text
"""

import requests
from pathlib import Path

def test_slide_5_edit():
    """Test editing text on slide 5"""
    
    outputs_dir = Path("backend/outputs")
    pptx_files = list(outputs_dir.glob("*.pptx"))
    
    if not pptx_files:
        print("❌ No PowerPoint files found")
        return False
    
    test_file = pptx_files[0]
    print(f"🎯 Testing with: {test_file.name}")
    
    # Test editing the Entry Age text on slide 5
    test_cases = [
        {
            "prompt": "On slide 5, change 'Entry Age' to 'Starting Age'",
            "description": "Change Entry Age to Starting Age"
        },
        {
            "prompt": "Change 'Maturity Age' to 'Final Age' on slide 5",
            "description": "Change Maturity Age to Final Age"
        },
        {
            "prompt": "On slide 5, change 'Minimum' to 'Min'",
            "description": "Change Minimum to Min"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['description']}")
        print(f"   Prompt: {test_case['prompt']}")
        
        try:
            with open(test_file, 'rb') as f:
                files = {'file': (test_file.name, f, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
                data = {
                    'edit_prompt': test_case['prompt'],
                    'slide_number': 5,
                    'output_format': 'pptx'
                }
                
                response = requests.post(
                    "http://localhost:8000/edit-with-prompt",
                    files=files,
                    data=data,
                    timeout=60
                )
                
                if response.status_code == 200:
                    output_file = outputs_dir / f"slide5_test_{i}_{test_file.name}"
                    with open(output_file, 'wb') as f:
                        f.write(response.content)
                    
                    print(f"   ✅ Success! Saved as: {output_file.name}")
                else:
                    print(f"   ❌ Failed with status {response.status_code}")
                    print(f"   Response: {response.text[:300]}...")
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing Slide 5 Specific Edits")
    print("=" * 40)
    test_slide_5_edit()
