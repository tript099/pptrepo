#!/usr/bin/env python3
"""
Test script for the new prompt-based editing functionality
"""

import requests
import json
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_prompt_editing():
    """Test the new prompt-based editing endpoint"""
    
    # Check if we have any existing presentation to test with
    outputs_dir = Path("backend/outputs")
    pptx_files = list(outputs_dir.glob("*.pptx"))
    
    if not pptx_files:
        print("❌ No PowerPoint files found in outputs directory to test with")
        print("🔄 Generate a presentation first using the main app")
        return False
    
    # Use the first available PPTX file
    test_file = pptx_files[0]
    print(f"🎯 Testing with file: {test_file.name}")
    
    # Test data
    edit_prompts = [
        "Add a bullet point 'Achieved 30% growth in Q3' to slide 2",
        "Change the title of slide 1 to 'Updated Business Review'",
        "On slide 3, add a pie chart showing market segments: Enterprise (60%), SMB (30%), Startup (10%)"
    ]
    
    for i, prompt in enumerate(edit_prompts, 1):
        print(f"\n🔧 Test {i}: {prompt}")
        
        try:
            # Prepare the request
            with open(test_file, 'rb') as f:
                files = {'file': (test_file.name, f, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
                data = {
                    'edit_prompt': prompt,
                    'output_format': 'pptx'
                }
                
                # Make the request
                response = requests.post(
                    f"{BASE_URL}/edit-with-prompt",
                    files=files,
                    data=data,
                    timeout=120
                )
                
                if response.status_code == 200:
                    # Save the edited file
                    output_file = f"test_edited_{i}_{test_file.name}"
                    output_path = outputs_dir / output_file
                    
                    with open(output_path, 'wb') as f:
                        f.write(response.content)
                    
                    print(f"✅ Test {i} successful! Saved: {output_file}")
                else:
                    print(f"❌ Test {i} failed with status {response.status_code}")
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Test {i} failed with error: {e}")
    
    print("\n🎉 Prompt-based editing tests completed!")
    return True

def test_ai_service_connectivity():
    """Test if the AI service is working"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Backend API is running")
            return True
        else:
            print(f"❌ Backend API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend API: {e}")
        print("🔄 Make sure to start the backend server with: uvicorn main:app --reload")
        return False

if __name__ == "__main__":
    print("🚀 Testing Prompt-Based PPT Editing")
    print("=" * 50)
    
    # Test connectivity first
    if test_ai_service_connectivity():
        test_prompt_editing()
    else:
        print("\n📋 To start the backend server:")
        print("   cd backend")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
