#!/usr/bin/env python3
"""
Simple test to verify the prompt-based editing functionality
"""

import requests
import os
from pathlib import Path

def test_simple_edit():
    """Test a simple text replacement"""
    
    # Check if backend is running
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code != 200:
            print("❌ Backend server is not running")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    print("✅ Backend server is running")
    
    # Find a presentation file to test with
    outputs_dir = Path("backend/outputs")
    pptx_files = list(outputs_dir.glob("*.pptx"))
    
    if not pptx_files:
        print("❌ No PowerPoint files found to test with")
        print("💡 Generate a presentation first using the web interface")
        return False
    
    test_file = pptx_files[0]
    print(f"🎯 Testing with: {test_file.name}")
    
    # Test a simple text change
    edit_prompt = "Change the text 'Policy Term' to 'Term Policy'"
    
    print(f"📝 Edit request: {edit_prompt}")
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file.name, f, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
            data = {
                'edit_prompt': edit_prompt,
                'output_format': 'pptx'
            }
            
            response = requests.post(
                "http://localhost:8000/edit-with-prompt",
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                # Save the result
                output_file = outputs_dir / f"test_edit_{test_file.name}"
                with open(output_file, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ Edit successful! Saved as: {output_file.name}")
                return True
            else:
                print(f"❌ Edit failed with status {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return False
                
    except Exception as e:
        print(f"❌ Error during edit test: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Prompt-Based Editing")
    print("=" * 40)
    
    success = test_simple_edit()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("\n💡 You can now use the web interface at http://localhost:3000")
        print("   Scroll down to the 'Edit Existing Presentation with AI' section")
    else:
        print("\n❌ Test failed. Please check the logs above.")
