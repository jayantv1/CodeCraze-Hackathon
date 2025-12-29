"""
Prompt templates for the teacher chatbot.
"""

# System prompt for the chatbot
SYSTEM_PROMPT = """You are an AI teaching assistant for LümFlare, a platform designed to help teachers communicate, collaborate, and manage their teaching responsibilities.

Your role is to:
1. Answer questions about teaching materials, curriculum, and educational content
2. Help teachers create educational materials (worksheets, quizzes, tests, assignments)
3. Provide guidance on using LümFlare platform features
4. Assist with lesson planning and instructional design

You have access to:
- Uploaded instructional files (PDFs, DOCX, PPTX, TXT) that teachers have shared
- Platform documentation and feature guides
- General teaching knowledge

Always be helpful, professional, and focused on supporting teachers in their work."""

# Prompt template for Q&A with context
QA_PROMPT_TEMPLATE = """{system_prompt}

Context from uploaded documents:
{context}

User question: {question}

Please provide a helpful answer based on the context provided. If the context doesn't contain enough information, you can use your general knowledge but indicate when you're doing so.

Format your response using markdown syntax:
- Use ### three hashtags for section headers
- Use **double asterisks** for bold text
- Use bullet points or numbered lists where appropriate
- Use code blocks for any code snippets
"""

# Prompt template for material generation
MATERIAL_GENERATION_PROMPT_TEMPLATE = """{system_prompt}

Context from uploaded documents:
{context}

User request: {request}

Generate the material strictly following this structure. Do NOT include any intro or outro text, just the worksheet content.

Structure:
Title: [Topic] Worksheet

Part A: Multiple Choice
1. Question
A. Option
...

Part B: Fill in the Blank
...

Part C: Open-Ended Questions
...

Part D: Challenge Question (Optional)
...

Answer Key Summary (Optional)
...

Make sure to use standard numbering (1., 2., etc.) and lettered options (A., B., etc.). Use Times New Roman friendly formatting (no special emojis).

If the content includes any diagrams, code snippets, or ascii art, enclose them in triple backticks (```) to preserve formatting.
Do NOT use separate lines with just a backslash (\) for blank space, simply leave blank lines."""

# Specific templates for different material types
WORKSHEET_PROMPT = """Generate a worksheet based on the following context and requirements:

Context: {context}
Subject: {subject}
Grade Level: {grade_level}
Topic: {topic}
Number of Questions: {num_questions}
Format: {format}

Create a comprehensive worksheet with clear instructions, appropriate questions/exercises, and space for student responses."""

QUIZ_PROMPT = """Generate a quiz based on the following context and requirements:

Context: {context}
Subject: {subject}
Grade Level: {grade_level}
Topic: {topic}
Number of Questions: {num_questions}
Question Types: {question_types}
Time Limit: {time_limit}

Create a quiz with clear questions, answer choices (if multiple choice), and an answer key."""

TEST_PROMPT = """Generate a test based on the following context and requirements:

Context: {context}
Subject: {subject}
Grade Level: {grade_level}
Topic: {topic}
Number of Questions: {num_questions}
Question Types: {question_types}
Total Points: {total_points}
Time Limit: {time_limit}

Create a comprehensive test with various question types, clear instructions, point values, and a detailed answer key."""

ASSIGNMENT_PROMPT = """Generate an assignment based on the following context and requirements:

Context: {context}
Subject: {subject}
Grade Level: {grade_level}
Topic: {topic}
Assignment Type: {assignment_type}
Requirements: {requirements}
Due Date Guidance: {due_date_guidance}

Create a detailed assignment with clear objectives, instructions, requirements, and grading rubric."""

# Platform feature documentation prompt
PLATFORM_FEATURES_PROMPT = """You are helping a teacher understand LümFlare platform features. Here is the platform documentation:

{platform_docs}

User question about platform: {question}

Provide a clear, helpful answer about how to use the platform feature."""


def format_qa_prompt(question: str, context: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    """Format Q&A prompt with context."""
    return QA_PROMPT_TEMPLATE.format(
        system_prompt=system_prompt,
        context=context,
        question=question
    )


def format_material_prompt(request: str, context: str, material_type: str = "material",
                          system_prompt: str = SYSTEM_PROMPT, **kwargs) -> str:
    """Format material generation prompt."""
    if material_type == "worksheet":
        return WORKSHEET_PROMPT.format(context=context, **kwargs)
    elif material_type == "quiz":
        return QUIZ_PROMPT.format(context=context, **kwargs)
    elif material_type == "test":
        return TEST_PROMPT.format(context=context, **kwargs)
    elif material_type == "assignment":
        return ASSIGNMENT_PROMPT.format(context=context, **kwargs)
    else:
        return MATERIAL_GENERATION_PROMPT_TEMPLATE.format(
            system_prompt=system_prompt,
            context=context,
            request=request
        )


def format_platform_prompt(question: str, platform_docs: str) -> str:
    """Format platform feature question prompt."""
    return PLATFORM_FEATURES_PROMPT.format(
        platform_docs=platform_docs,
        question=question
    )

