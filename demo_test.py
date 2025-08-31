#!/usr/bin/env python3
"""
Demo script to test the AI-Powered PPT Automation System
"""

import asyncio
import json
import sys
import os

# Add backend to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.ai_service import AIService
from backend.services.ppt_service import PPTService

async def test_demo_generation():
    """Test generating a demo presentation"""
    
    print("🎯 AI-Powered PPT Automation System - Demo Test")
    print("=" * 50)
    
    # Demo prompt
    demo_prompt = """
    Create a quarterly business review presentation for TechCorp, a growing SaaS company. 
    Include:
    - Executive summary with key achievements
    - Revenue growth charts showing 25% increase
    - Customer acquisition metrics
    - Product development updates
    - Team expansion and hiring plans
    - Q4 goals and objectives
    """
    
    print(f"📝 Demo Prompt:")
    print(f"{demo_prompt.strip()}")
    print("\n" + "=" * 50)
    
    try:
        # Initialize services
        print("🔧 Initializing AI and PPT services...")
        ai_service = AIService()
        ppt_service = PPTService()
        
        # Generate slide structure with AI
        print("🤖 Generating slide structure with AI...")
        slide_data = await ai_service.generate_slide_structure(demo_prompt)
        
        print("✅ AI generation completed!")
        print(f"📊 Generated {len(slide_data['slides'])} slides")
        print(f"📋 Presentation title: {slide_data['meta']['deck_title']}")
        
        # Display slide overview
        print("\n📑 Slide Overview:")
        for i, slide in enumerate(slide_data['slides'], 1):
            layout = slide['layout']
            title = slide.get('title', 'Untitled')
            print(f"  {i}. {layout.upper()}: {title}")
        
        # Generate PowerPoint file
        print("\n🎨 Creating PowerPoint presentation...")
        pptx_path = ppt_service.create_presentation(slide_data)
        
        print(f"✅ Presentation created successfully!")
        print(f"📁 File saved: {pptx_path}")
        
        # Display generated JSON structure (pretty printed)
        print("\n🔍 Generated JSON Structure:")
        print("=" * 30)
        print(json.dumps(slide_data, indent=2))
        
        return pptx_path
        
    except Exception as e:
        print(f"❌ Error during demo generation: {e}")
        return None

def main():
    """Main demo function"""
    print("Starting demo test...")
    
    # Check if we have required environment variables
    if not os.getenv('LITELLM_API_KEY'):
        print("⚠️  Warning: LITELLM_API_KEY not found in environment")
        print("   The AI service will use a fallback structure for demo purposes")
        print()
    
    # Run the async demo
    result = asyncio.run(test_demo_generation())
    
    if result:
        print(f"\n🎉 Demo completed successfully!")
        print(f"📁 Generated file: {result}")
        print("\n💡 Next steps:")
        print("   1. Open the generated PowerPoint file")
        print("   2. Start the FastAPI backend: cd backend && uvicorn main:app --reload")
        print("   3. Start the React frontend: cd frontend && npm run dev")
        print("   4. Test the web interface at http://localhost:3000")
    else:
        print("\n❌ Demo failed. Please check the error messages above.")

if __name__ == "__main__":
    main() 