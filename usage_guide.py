#!/usr/bin/env python3
"""
Guide for using the improved prompt-based editing system
"""

def show_usage_guide():
    print("🎯 AI-Powered PowerPoint Editing - Usage Guide")
    print("=" * 60)
    
    print("\n🌐 Web Interface: http://localhost:3000")
    print("   Scroll down to: '✏️ Edit Existing Presentation with AI'")
    
    print("\n📝 Example Edit Prompts That Work Well:")
    print()
    
    examples = [
        {
            "category": "Text Changes",
            "prompts": [
                "On slide 5, change 'Entry Age' to 'Starting Age'",
                "Change 'Maturity Age' to 'Final Age' on slide 5",
                "Change 'Policy Term' to 'Term Policy'",
                "On slide 3, change the title 'Key Benefits' to 'Main Advantages'"
            ]
        },
        {
            "category": "Adding Content",
            "prompts": [
                "Add bullet point 'Improved customer satisfaction by 25%' to slide 3",
                "On slide 4, add a pie chart showing market share: Desktop (45%), Mobile (35%), Tablet (20%)",
                "Add a table with sales data to slide 6",
                "Add text box with 'Important Note: Please review terms' to slide 2"
            ]
        },
        {
            "category": "Slide-Specific Changes",
            "prompts": [
                "On slide 5, change 'Minimum' to 'Min'",
                "On slide 7, change 'Premium Payment Term' to 'Payment Period'",
                "Change 'PT 15 years' to 'PT 20 years' on slide 5",
                "On slide 1, change the title to 'Updated Insurance Plan'"
            ]
        }
    ]
    
    for example in examples:
        print(f"📂 {example['category']}:")
        for prompt in example['prompts']:
            print(f"   • \"{prompt}\"")
        print()
    
    print("💡 Tips for Better Results:")
    print("   ✅ Be specific about slide numbers")
    print("   ✅ Use exact text you want to change")
    print("   ✅ Put text in quotes when unclear")
    print("   ✅ Start with simple changes first")
    print("   ✅ Check the result before making more changes")
    print()
    
    print("🔧 What the System Can Do:")
    print("   • Change any text on any slide")
    print("   • Add bullet points, charts, tables")
    print("   • Modify slide titles")
    print("   • Replace content elements")
    print("   • Add new text boxes")
    print()
    
    print("⚠️ Common Issues and Solutions:")
    print("   ❌ 'Text not found' → Use exact text from the slide")
    print("   ❌ Wrong slide edited → Specify slide number clearly") 
    print("   ❌ Nothing changed → Try simpler, more specific prompts")
    print("   ❌ AI confusion → Use the format: 'On slide X, change Y to Z'")
    print()
    
    print("🎮 Try It Now:")
    print("   1. Open http://localhost:3000")
    print("   2. Upload your PowerPoint file")
    print("   3. Try: 'On slide 5, change Entry Age to Starting Age'")
    print("   4. Download and check the result!")

if __name__ == "__main__":
    show_usage_guide()
