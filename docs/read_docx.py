import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r"c:\Users\hajer aouani\OneDrive - Tunytech business\Bureau\Cahier de charge talentflow.docx"
output_path = r"c:\Users\hajer aouani\OneDrive - Tunytech business\Bureau\Talentflow\docs\cahier_des_charges.md"

if not os.path.exists(docx_path):
    print(f"File not found: {docx_path}")
    exit(1)

try:
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        
    root = ET.fromstring(xml_content)
    
    # Namespaces
    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        text_elems = para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        text = ''.join(node.text for node in text_elems if node.text)
        if text:
            paragraphs.append(text)
            
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Cahier des Charges - Talentflow\n\n")
        for p in paragraphs:
            f.write(p + "\n\n")
            
    print(f"Successfully extracted {len(paragraphs)} paragraphs to {output_path}")
except Exception as e:
    print(f"Error: {e}")
