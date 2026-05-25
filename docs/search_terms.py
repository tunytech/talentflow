with open(r"c:\Users\hajer aouani\OneDrive - Tunytech business\Bureau\Talentflow\docs\cahier_des_charges.md", 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "priorit" in line.lower() or "module" in line.lower():
        # print first 100 chars
        print(f"Line {i+1}: {line.strip()[:100]}")
