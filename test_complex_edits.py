#!/usr/bin/env python3
"""
Test more complex editing scenarios
"""

import requests
import os
from pathlib import Path

def test_complex_edits():
    """Test various types of edits"""
    
    outputs_dir = Path("backend/outputs")
    pptx_files = list(outputs_dir.glob("*.pptx"))
    
    if not pptx_files:
        print("❌ No PowerPoint files found to test with")
        return False
    
    test_file = pptx_files[0]
    print(f"🎯 Testing with: {test_file.name}")
    
    # Test scenarios
    test_cases = [
        {
            "name": "Title Change",
            "prompt": "Change the title 'Key Benefits' to 'Main Advantages'",
            "slide": 3
        },
        {
            "name": "Add Bullet Point", 
            "prompt": "Add bullet point 'Improved customer satisfaction by 25%' to slide 3",
            "slide": 3
        },
        {
            "name": "Text Replacement",
            "prompt": "Change 'Premium Payment Term' to 'Payment Period' on slide 7",
            "slide": 7
        },
        {
            "name": "Add Chart",
            "prompt": "Add a pie chart showing market share: Desktop (45%), Mobile (35%), Tablet (20%) to slide 4",
            "slide": 4
        }
    ]
    
    success_count = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['name']}")
        print(f"   Prompt: {test_case['prompt']}")
        
        try:
            with open(test_file, 'rb') as f:
                files = {'file': (test_file.name, f, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
                data = {
                    'edit_prompt': test_case['prompt'],
                    'slide_number': test_case.get('slide', ''),
                    'output_format': 'pptx'
                }
                
                response = requests.post(
                    "http://localhost:8000/edit-with-prompt",
                    files=files,
                    data=data,
                    timeout=90
                )
                
                if response.status_code == 200:
                    # Save the result
                    output_file = outputs_dir / f"test_{i}_{test_case['name'].replace(' ', '_').lower()}_{test_file.name}"
                    with open(output_file, 'wb') as f:
                        f.write(response.content)
                    
                    print(f"   ✅ Success! Saved as: {output_file.name}")
                    success_count += 1
                else:
                    print(f"   ❌ Failed with status {response.status_code}")
                    print(f"   Response: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"\n📊 Results: {success_count}/{len(test_cases)} tests passed")
    return success_count == len(test_cases)

if __name__ == "__main__":
    print("🧪 Testing Complex Editing Scenarios")
    print("=" * 50)
    
    success = test_complex_edits()
    
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")
    
    print("\n💡 Check the backend/outputs folder for the generated files.")
