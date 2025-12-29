
import io
import re
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Line

def markdown_to_pdf(text, title="Worksheet"):
    """
    Convert markdown-like text to a PDF file using ReportLab.
    Returns the PDF content as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=50, leftMargin=50,
                            topMargin=50, bottomMargin=50)
    
    styles = getSampleStyleSheet()
    
    # Define custom styles for Times New Roman
    # Note: Standard Times-Roman is built-in to PDF readers, so we don't strictly need to register TTF 
    # unless we want to embed it. Using standard 'Times-Roman' is safer and easier.
    
    # Title Style
    title_style = ParagraphStyle(
        'WorksheetTitle',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    # Normal Text Style
    normal_style = ParagraphStyle(
        'WorksheetNormal',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=12,
        leading=14,
        spaceAfter=10
    )
    
    # Heading/Section Style
    heading_style = ParagraphStyle(
        'WorksheetHeading',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=14,
        leading=16,
        spaceBefore=15,
        spaceAfter=10,
        textColor=colors.black # Ensure it's black not blue like default Heading2
    )

    # Code/Diagram Style
    code_style = ParagraphStyle(
        'WorksheetCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=10,
        leading=12,
        spaceAfter=10,
        leftIndent=20
    )

    story = []
    
    # Add Header Information
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Name: __________________________", normal_style))
    story.append(Paragraph("Date: __________________________", normal_style))
    story.append(Spacer(1, 20))
    
    # Process the text content
    lines = text.split('\n')
    in_code_block = False
    code_buffer = []
    
    # Filter out initial conversational fluff
    start_index = 0
    conversational_prefixes = [
        "sure", "certainly", "of course", "here is", "here's", "okay", 
        "i have generated", "please find", "based on", "generated"
    ]
    
    for i, line in enumerate(lines):
        stripped_lower = line.strip().lower()
        if not stripped_lower:
            start_index = i + 1
            continue
            
        # Check if line starts with conversational filler
        is_conversational = any(stripped_lower.startswith(prefix) for prefix in conversational_prefixes)
        
        # Also check for lines that end with specific punctuation often used in intros (like ":") 
        # but avoid headers (which might not have punctuation or start with #)
        if is_conversational:
            start_index = i + 1
            continue
        
        # If we reached here, we found non-conversational content (or a header)
        # However, sometimes "Title: ..." is what we want. 
        # If the line starts with "Title:" or "Part" or "#" or "1.", it's definitely content.
        # If it's just a sentence like "Read the questions below", that's also content.
        # The filter mainly targetted the LLM acknowledging the request.
        break
        
    lines = lines[start_index:]
    
    # We also want to skip the title if it appears again in the first few lines of the body
    # Normalized check for title repetition
    normalized_title = title.lower().strip()
    
    # We also want to skip the title if it appears again in the first few lines of the body
    # Normalized check for title repetition
    normalized_title = title.lower().strip()
    
    current_section_has_questions = False

    for line in lines:
        stripped_line = line.strip()
        
        # Check if this line is just a repetition of the title
        if stripped_line.lower().strip() == normalized_title:
             continue
        if stripped_line.lower().strip().replace('*', '').replace('#', '').strip() == normalized_title:
             continue
        if stripped_line.lower().startswith("title:") and "worksheet" in stripped_line.lower():
             continue
             
        # skip lines that are just a backslash (artifact) using a regex or stricter check
        # The user mentioned "/" but screenshot showed "\". I'll filter both if they are standalone.
        if stripped_line in ['\\', '/', "'"] or re.match(r'^[\\/]+$', stripped_line):
             continue
             
        # Detect code block start/end
        if stripped_line.startswith('```'):
            if in_code_block:
                # End of block - flush buffer
                if code_buffer:
                    # preserve internal newlines for preformatted text
                    # replace newlines with <br/> for Paragraph or keep as is for Preformatted
                    # For ReportLab Paragraph with Courier, explicit <br/> is needed to break lines
                    code_content = "<br/>".join(code_buffer).replace(' ', '&nbsp;')
                    story.append(Paragraph(code_content, code_style))
                    code_buffer = []
                in_code_block = False
            else:
                in_code_block = True
            continue
            
        if in_code_block:
            # Preserve raw line content for code blocks, don't strip
            # But we need to handle HTML constraints
            safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            code_buffer.append(safe_line)
            continue

        if not stripped_line:
            continue
            
        # Check for Headers
        if stripped_line.startswith('###') or stripped_line.startswith('Part '):
            # New section, reset question counter
            current_section_has_questions = False
            
            content = stripped_line.replace('###', '').strip()
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
            story.append(Paragraph(content, heading_style))
            
        # Check for List items (Questions)
        elif stripped_line.startswith(('-', '*', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) or re.match(r'^\d+\.', stripped_line):
            # If it looks like a numbered question (starts with digit + dot)
            is_numbered_question = re.match(r'^\d+\.', stripped_line)
            
            if is_numbered_question:
                if current_section_has_questions:
                    # Add divider between questions
                    d = Drawing(500, 10)
                    d.add(Line(0, 5, 500, 5, strokeColor=colors.gray, strokeWidth=0.5))
                    story.append(Spacer(1, 5))
                    story.append(d)
                    story.append(Spacer(1, 5))
                current_section_has_questions = True
            
            content = stripped_line
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
            story.append(Paragraph(content, normal_style))
            
        else:
            # Regular text
            content = stripped_line
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
            story.append(Paragraph(content, normal_style))
            
    # Flush any remaining code buffer (closed without ```??)
    if code_buffer:
        code_content = "<br/>".join(code_buffer).replace(' ', '&nbsp;')
        story.append(Paragraph(code_content, code_style))
            
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
