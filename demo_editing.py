"""
Demo script showing how to use the new prompt-based editing functionality
"""

import requests
import json

# Example of using the new prompt-based editing API
def demo_prompt_editing():
    
    print("🎯 AI-Powered PowerPoint Editing Demo")
    print("=" * 50)
    
    # Example edit prompts you can use
    edit_examples = [
        {
            "prompt": "On slide 3, add a pie chart showing market share: Desktop (45%), Mobile (35%), Tablet (20%)",
            "description": "Add a pie chart with specific data"
        },
        {
            "prompt": "Change the title from 'Key Benefits' to 'Main Advantages' on slide 2",
            "description": "Modify slide title"
        },
        {
            "prompt": "Add bullet point 'Improved customer satisfaction by 25%' to slide 4",
            "description": "Add new bullet point"
        },
        {
            "prompt": "Replace the table on slide 5 with a bar chart showing quarterly sales data",
            "description": "Replace content type"
        },
        {
            "prompt": "Add a new slide with title 'Next Steps' and bullet points about future goals",
            "description": "Add entirely new slide"
        },
        {
            "prompt": "Change all instances of 'Q2' to 'Q3' in the presentation",
            "description": "Global text replacement"
        }
    ]
    
    print("📝 Example edit prompts you can use:")
    print()
    
    for i, example in enumerate(edit_examples, 1):
        print(f"{i}. {example['description']}")
        print(f"   Prompt: \"{example['prompt']}\"")
        print()
    
    print("🌐 How to use with the web interface:")
    print("1. Start the backend: cd backend && uvicorn main:app --reload")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Open http://localhost:3000")
    print("4. Scroll down to the 'Edit Existing Presentation with AI' section")
    print("5. Upload a PowerPoint file")
    print("6. Enter your edit prompt")
    print("7. Click 'Edit with AI' to apply changes")
    print()
    
    print("🔧 How to use with the API directly:")
    print()
    print("```python")
    print("import requests")
    print()
    print("# Prepare your files and data")
    print("with open('your_presentation.pptx', 'rb') as f:")
    print("    files = {'file': ('presentation.pptx', f)}")
    print("    data = {")
    print("        'edit_prompt': 'Add a pie chart to slide 3',")
    print("        'slide_number': 3,  # optional")
    print("        'output_format': 'pptx'")
    print("    }")
    print("    ")
    print("    response = requests.post(")
    print("        'http://localhost:8000/edit-with-prompt',")
    print("        files=files,")
    print("        data=data")
    print("    )")
    print("    ")
    print("    # Save the edited presentation")
    print("    with open('edited_presentation.pptx', 'wb') as output:")
    print("        output.write(response.content)")
    print("```")
    print()
    
    print("✨ Supported editing operations:")
    print("• Add charts (pie, bar, column)")
    print("• Add tables with data")
    print("• Add bullet points")
    print("• Modify text content")
    print("• Change slide titles")
    print("• Replace content elements")
    print("• Add new text boxes")
    print("• Global text replacements")
    print()
    
    print("💡 Tips for better results:")
    print("• Be specific about slide numbers")
    print("• Include data for charts and tables")
    print("• Use clear, descriptive language")
    print("• Test with simple edits first")
    print("• Check the generated output")

if __name__ == "__main__":
    demo_prompt_editing()
