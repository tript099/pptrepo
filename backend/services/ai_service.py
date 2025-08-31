import openai
import json
import os
import asyncio
import concurrent.futures
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        api_key = os.getenv("LITELLM_API_KEY")
        base_url = os.getenv("LITELLM_BASE_URL")
        
        print(f"Initializing AI Service with:")
        print(f"  API Key: {api_key[:10]}..." if api_key else "  API Key: None")
        print(f"  Base URL: {base_url}")
        
        if not api_key:
            raise ValueError("LITELLM_API_KEY environment variable is required")
        if not base_url:
            raise ValueError("LITELLM_BASE_URL environment variable is required")
            
        # Configure openai for version 0.8.0 with LiteLLM
        openai.api_key = api_key
        openai.api_base = base_url
        
    async def generate_slide_structure(self, prompt: str) -> Dict[str, Any]:
        """
        Convert a text prompt into structured JSON for PowerPoint slides
        """
        system_prompt = """
You are an expert presentation designer. Convert the user's prompt into a structured JSON format for creating PowerPoint slides.

Follow this exact JSON schema:
{
  "meta": {
    "deck_title": "Short descriptive title",
    "template": "Corporate-Blue"
  },
  "slides": [
    {
      "layout": "title",
      "title": "Main Title",
      "subtitle": "Subtitle or company info"
    },
    {
      "layout": "bullets",
      "title": "Slide Title",
      "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
    },
    {
      "layout": "table",
      "title": "Table Title",
      "columns": ["Column 1", "Column 2", "Column 3"],
      "rows": [["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"], ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]]
    },
    {
      "layout": "chart.column",
      "title": "Chart Title",
      "categories": ["Category 1", "Category 2"],
      "series": {
        "Series 1": [10, 20],
        "Series 2": [15, 25]
      }
    }
  ]
}

Available layouts: "title", "bullets", "table", "chart.column", "chart.bar", "chart.pie", "chart.line"

Rules:
1. Always start with a title slide
2. Create 3-8 slides total
3. Use appropriate layouts based on content type
4. Make bullet points concise and actionable
5. Ensure data is realistic and relevant
6. Include charts/tables when data is mentioned
7. Return ONLY valid JSON, no other text
"""

        try:
            # Use OpenAI 0.8.0 with LiteLLM proxy - try chat-style format first
            def _sync_openai_call():
                print(f"Attempting API call with model: azure/gpt-4.1")
                print(f"Prompt length: {len(prompt)}")
                
                # Try Completion API with your model name first
                try:
                    # Format as a chat-style completion prompt
                    full_prompt = f"System: {system_prompt}\n\nUser: {prompt}\n\nAssistant:"
                    
                    response = openai.Completion.create(
                        engine="azure/gpt-4.1",  # Your model name
                        prompt=full_prompt,
                        temperature=0.7,
                        max_tokens=2000,
                        stop=["\nUser:", "\nHuman:", "\nSystem:"]
                    )
                    print(f"API Response received successfully with azure/gpt-4.1")
                    return response
                except Exception as e:
                    print(f"azure/gpt-4.1 failed: {e}")
                    # Fallback to other model names
                    fallback_models = ["gpt-4", "gpt-3.5-turbo", "text-davinci-003"]
                    for model in fallback_models:
                        try:
                            print(f"Trying fallback model: {model}")
                            response = openai.Completion.create(
                                engine=model,
                                prompt=full_prompt,
                                temperature=0.7,
                                max_tokens=2000,
                                stop=["\nUser:", "\nHuman:", "\nSystem:"]
                            )
                            print(f"Fallback successful with model: {model}")
                            return response
                        except Exception as fallback_error:
                            print(f"Fallback model {model} failed: {fallback_error}")
                            continue
                    raise e  # Re-raise original error if all fallbacks fail
            
            # Run in thread pool to make it async
            import concurrent.futures
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, _sync_openai_call)
            
            content = response.choices[0].text.strip()
            
            # Parse JSON response
            slide_data = json.loads(content)
            
            # Validate required structure
            if not all(key in slide_data for key in ["meta", "slides"]):
                raise ValueError("Invalid slide structure returned from AI")
                
            return slide_data
            
        except json.JSONDecodeError as e:
            # Fallback to a default structure if JSON parsing fails
            return self._get_fallback_structure(prompt)
        except Exception as e:
            print(f"Error generating slide structure: {e}")
            return self._get_fallback_structure(prompt)
    
    def _get_fallback_structure(self, prompt: str) -> Dict[str, Any]:
        """
        Fallback structure when AI fails or returns invalid JSON
        """
        return {
            "meta": {
                "deck_title": "Generated Presentation",
                "template": "Corporate-Blue"
            },
            "slides": [
                {
                    "layout": "title",
                    "title": "Generated Presentation",
                    "subtitle": "Created from your prompt"
                },
                {
                    "layout": "bullets",
                    "title": "Overview",
                    "bullets": [
                        "This presentation was generated from your prompt",
                        f"Original prompt: {prompt[:100]}...",
                        "Please refine your prompt for better results"
                    ]
                },
                {
                    "layout": "bullets",
                    "title": "Next Steps",
                    "bullets": [
                        "Review the generated content",
                        "Make necessary adjustments",
                        "Add more specific details to your prompt"
                    ]
                }
            ]
        }
    
    async def generate_slide_edits(self, edit_prompt: str, current_slide_data: Dict[str, Any], slide_number: int = None) -> Dict[str, Any]:
        """
        Generate specific edits for a presentation based on natural language prompts
        """
        system_prompt = """
You are an expert presentation editor. Based on the user's edit request and the current slide data, generate precise editing instructions.

The user can request changes like:
- "On slide 3, add a pie chart showing market share data"
- "Change the title from 'Key Benefits' to 'Main Advantages'"
- "Add bullet point about customer satisfaction to slide 2"
- "Replace the table on slide 4 with a bar chart"
- "Change the pie chart colors to blue and green"
- "On slide 5 change the text 'policy term' to 'term policy'"

IMPORTANT: Pay close attention to the user's exact request. If they want to change specific text, identify the exact slide and make the precise text replacement.

Analyze the current presentation structure and generate editing instructions in this JSON format:

{
  "edit_type": "specific_slide",
  "target_slides": [slide_numbers],
  "edits": [
    {
      "slide_index": number,
      "action": "modify_content",
      "target_element": "text",
      "changes": {
        "find": "original text to find",
        "replace": "new text to replace with"
      }
    }
  ]
}

Actions available:
- "modify_content": Change existing text, titles, or content
- "add_content": Add new charts, tables, bullet points, or text
- "replace_content": Replace one type of content with another
- "delete_content": Remove specific content

Target elements:
- "title": Slide title
- "text": Any text content
- "bullets": Bullet point lists
- "chart": Charts and graphs
- "table": Tables

For text changes, always use "find" and "replace" in changes object.
For adding content, use appropriate data structures.

Current presentation has {total_slides} slides.
"""

        user_prompt = f"""
Current presentation structure:
{json.dumps(current_slide_data, indent=2)}

Edit request: {edit_prompt}

IMPORTANT: 
1. Analyze the edit request carefully and identify the exact slide number if mentioned
2. Look at the slide content to find the exact text that needs to be changed
3. Be precise with the find and replace text - use the EXACT text from the slides
4. If the user mentions a specific slide number, use that slide number

Generate the editing instructions to fulfill this request.
"""

        try:
            # Use OpenAI 0.8.0 with LiteLLM proxy for editing
            def _sync_openai_call():
                full_system_prompt = system_prompt.format(
                    total_slides=len(current_slide_data.get('slides', []))
                )
                
                print(f"Attempting edit API call with model: azure/gpt-4.1")
                print(f"User prompt: {user_prompt}")
                
                # Format as a chat-style completion prompt
                full_prompt = f"System: {full_system_prompt}\n\nUser: {user_prompt}\n\nAssistant:"
                
                try:
                    response = openai.Completion.create(
                        engine="azure/gpt-4.1",  # Your model name
                        prompt=full_prompt,
                        temperature=0.3,
                        max_tokens=2000,
                        stop=["\nUser:", "\nHuman:", "\nSystem:"]
                    )
                    print(f"Edit API Response received successfully with azure/gpt-4.1")
                    return response
                except Exception as e:
                    print(f"azure/gpt-4.1 failed for editing: {e}")
                    # Fallback to other model names
                    fallback_models = ["gpt-4", "gpt-3.5-turbo", "text-davinci-003"]
                    for model in fallback_models:
                        try:
                            print(f"Trying fallback model for editing: {model}")
                            response = openai.Completion.create(
                                engine=model,
                                prompt=full_prompt,
                                temperature=0.3,
                                max_tokens=2000,
                                stop=["\nUser:", "\nHuman:", "\nSystem:"]
                            )
                            print(f"Edit fallback successful with model: {model}")
                            return response
                        except Exception as fallback_error:
                            print(f"Edit fallback model {model} failed: {fallback_error}")
                            continue
                    raise e  # Re-raise original error if all fallbacks fail
            
            # Run in thread pool to make it async
            import concurrent.futures
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, _sync_openai_call)
            
            response_text = response.choices[0].text.strip()
            print(f"AI editing response: {response_text}")
            
            # Extract JSON from the response more robustly
            try:
                # Try to find JSON block first
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                elif "```" in response_text:
                    # Try generic code block
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                else:
                    # Try to find JSON structure in the text
                    json_start = response_text.find("{")
                    json_end = response_text.rfind("}") + 1
                    if json_start != -1 and json_end > json_start:
                        json_text = response_text[json_start:json_end]
                    else:
                        json_text = response_text
                
                edit_instructions = json.loads(json_text)
                
                if not isinstance(edit_instructions, dict) or "edits" not in edit_instructions:
                    raise ValueError("Invalid edit instructions returned from AI")
                    
                return edit_instructions
                
            except json.JSONDecodeError as e:
                print(f"JSON decode error in edit generation: {e}")
                print(f"Attempted to parse: {json_text}")
                return self._get_fallback_edit_instructions(edit_prompt, slide_number)
        except Exception as e:
            print(f"Error generating edit instructions: {e}")
            return self._get_fallback_edit_instructions(edit_prompt, slide_number)
    
    def _get_fallback_edit_instructions(self, edit_prompt: str, slide_number: int = None) -> Dict[str, Any]:
        """
        Fallback edit instructions when AI fails
        """
        # Try to extract slide number from prompt
        import re
        slide_match = re.search(r'slide\s+(\d+)', edit_prompt.lower())
        if slide_match:
            target_slide = int(slide_match.group(1))
        else:
            target_slide = slide_number if slide_number else 1
        
        # Try to parse simple text replacement from the prompt
        if "change" in edit_prompt.lower():
            # Look for patterns like "change X to Y" or "change 'X' to 'Y'"
            change_patterns = [
                r"change\s+['\"]([^'\"]+)['\"]?\s+to\s+['\"]([^'\"]+)['\"]?",
                r"change\s+(.+?)\s+to\s+(.+?)(?:\s+on|\s+in|\s*$)",
                r"change\s+the\s+(.+?)\s+to\s+(.+?)(?:\s+on|\s+in|\s*$)"
            ]
            
            for pattern in change_patterns:
                match = re.search(pattern, edit_prompt.lower())
                if match:
                    find_text = match.group(1).strip().strip("'\"")
                    replace_text = match.group(2).strip().strip("'\"")
                    
                    return {
                        "edit_type": "specific_slide",
                        "target_slides": [target_slide],
                        "edits": [
                            {
                                "slide_index": target_slide,
                                "action": "modify_content",
                                "target_element": "text",
                                "changes": {
                                    "find": find_text,
                                    "replace": replace_text
                                }
                            }
                        ]
                    }
        
        # Look for "add" commands
        elif "add" in edit_prompt.lower():
            if "bullet" in edit_prompt.lower():
                # Extract bullet point text
                bullet_match = re.search(r"add.*bullet.*['\"]([^'\"]+)['\"]?", edit_prompt.lower())
                if bullet_match:
                    bullet_text = bullet_match.group(1)
                    return {
                        "edit_type": "specific_slide",
                        "target_slides": [target_slide],
                        "edits": [
                            {
                                "slide_index": target_slide,
                                "action": "add_content",
                                "target_element": "bullets",
                                "changes": {
                                    "add_bullet": bullet_text
                                }
                            }
                        ]
                    }
            elif "chart" in edit_prompt.lower():
                return {
                    "edit_type": "specific_slide",
                    "target_slides": [target_slide],
                    "edits": [
                        {
                            "slide_index": target_slide,
                            "action": "add_content",
                            "target_element": "chart",
                            "changes": {
                                "chart_type": "pie",
                                "chart_data": {
                                    "categories": ["Category A", "Category B", "Category C"],
                                    "values": [30, 40, 30]
                                }
                            }
                        }
                    ]
                }
        
        # Default fallback - add as note
        return {
            "edit_type": "specific_slide",
            "target_slides": [target_slide],
            "edits": [
                {
                    "slide_index": target_slide,
                    "action": "add_content",
                    "target_element": "bullets",
                    "changes": {
                        "new_content": f"Note: {edit_prompt}"
                    }
                }
            ]
        }