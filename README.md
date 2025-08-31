# 🎯 AI-Powered PPT Automation System

A complete MVP system that generates professional PowerPoint presentations from text prompts using OpenAI GPT-4o and FastAPI.

## ✨ Features

- **AI-Powered Generation**: Convert text prompts into structured presentations
- **🆕 Prompt-Based Editing**: Edit existing presentations using natural language commands
- **Multiple Layouts**: Title slides, bullet points, tables, and charts
- **Corporate Templates**: Professional styling and formatting
- **Dual Output**: Generate both `.pptx` and `.pdf` formats
- **Web Interface**: User-friendly React frontend
- **Bulk Processing**: Generate multiple presentations from CSV data
- **Advanced Edit Functionality**: Modify existing presentations with AI assistance

## 🏗️ Architecture

```
ppt-automation/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   └── services/           
│       ├── ai_service.py   # OpenAI integration
│       ├── ppt_service.py  # PowerPoint generation
│       └── pdf_service.py  # PDF conversion
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   └── components/
│   │       └── PromptForm.jsx  # Form component
│   └── package.json
├── outputs/               # Generated files
├── requirements.txt       # Python dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- LiteLLM API key

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env and add your LiteLLM configuration
   LITELLM_API_KEY=sk-Jb-zYD51whLDcSGpFE3BDw
   LITELLM_BASE_URL=https://proxyllm.ximplify.id
   ```

3. **Start the FastAPI server**:
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

   The web interface will be available at `http://localhost:3000`

## 📡 API Endpoints

### POST `/generate`
Generate a presentation from a text prompt.

**Request Body**:
```json
{
  "prompt": "Create a Q2 business review with sales data and key metrics",
  "output_format": "pptx"  // or "pdf"
}
```

**Response**: Downloads the generated presentation file.

### POST `/edit`
Edit an existing presentation.

**Form Data**:
- `file`: Upload existing `.pptx` file
- `updates`: JSON string with modifications

### POST `/edit-with-prompt`
🆕 **NEW!** Edit an existing presentation using natural language prompts.

**Form Data**:
- `file`: Upload existing `.pptx` file
- `edit_prompt`: Natural language editing instruction
- `slide_number`: Target slide number (optional)
- `output_format`: "pptx" or "pdf" (default: "pptx")

**Example prompts**:
- "On slide 3, add a pie chart showing market share data"
- "Change the title from 'Key Benefits' to 'Main Advantages'"
- "Add bullet point about customer satisfaction to slide 2"
- "Replace the table on slide 4 with a bar chart"
- "Change the pie chart colors to blue and green"

**Response**: Downloads the edited presentation file.

### POST `/bulk`
Generate multiple presentations from CSV data.

**Form Data**:
- `file`: Upload CSV file with prompts/data

**Response**: Downloads a ZIP file with all generated presentations.

## 🎨 Slide Layouts

The system supports multiple slide layouts:

- **Title Slide**: Main title and subtitle
- **Bullet Points**: Lists and key points
- **Tables**: Structured data display
- **Charts**: Column, bar, line, and pie charts

## 🔧 Configuration

### Environment Variables

- `LITELLM_API_KEY`: Your LiteLLM API key (required)
- `LITELLM_BASE_URL`: LiteLLM proxy base URL (required)
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)

### PDF Conversion

The system supports multiple PDF conversion methods:

1. **LibreOffice** (recommended, cross-platform)
2. **Windows COM** (Windows only, requires PowerPoint)
3. **Aspose.Slides** (commercial, optional)

## 📝 Example Prompts

Try these example prompts to get started:

- "Create a Q2 business review presentation for a SaaS company with revenue charts and key metrics"
- "Generate a marketing strategy presentation for launching a new mobile app"
- "Build a project status update deck with timeline, milestones, and team progress"
- "Create an employee onboarding presentation with company values and processes"

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm run build
```

## 🔒 Security Notes

- Store your LiteLLM API key securely in environment variables
- Never commit API keys to version control
- The system includes CORS protection for the frontend
- Generated files are temporarily stored and should be cleaned up regularly

## 🎯 AI Output Schema

The AI generates structured JSON following this schema:

```json
{
  "meta": {
    "deck_title": "Presentation Title",
    "template": "Corporate-Blue"
  },
  "slides": [
    {
      "layout": "title",
      "title": "Main Title",
      "subtitle": "Subtitle"
    },
    {
      "layout": "bullets",
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"]
    },
    {
      "layout": "table",
      "title": "Data Table",
      "columns": ["Col 1", "Col 2"],
      "rows": [["Data 1", "Data 2"]]
    },
    {
      "layout": "chart.column",
      "title": "Chart Title",
      "categories": ["Cat 1", "Cat 2"],
      "series": {
        "Series 1": [10, 20],
        "Series 2": [15, 25]
      }
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

1. **LiteLLM API Errors**: Ensure your API key is valid and the proxy URL is accessible
2. **PDF Conversion Fails**: Install LibreOffice for cross-platform PDF support
3. **Port Conflicts**: Change the port in the configuration if 8000 is occupied
4. **CORS Issues**: Ensure the frontend URL is included in the CORS settings

### Error Messages

- `Invalid slide structure`: The AI returned malformed JSON
- `No PDF conversion method available`: Install LibreOffice or enable COM on Windows
- `Generation timeout`: Increase the timeout for complex presentations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- LiteLLM for the AI proxy service
- OpenAI for the underlying GPT-4 model
- python-pptx for PowerPoint generation
- FastAPI for the web framework
- React for the frontend interface 