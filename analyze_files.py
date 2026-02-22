import os
import zipfile
import json
import re

DATA_DIR = r"C:\Users\david\.gemini\antigravity\scratch\legal-case-portal\data"

# We will just traverse the directories and print out interesting file names
# and if there are accessible readable files (.txt, .md, .csv) we will read them.
# For PDFs, DOCX, XLSX, we'll just list them as assets unless we can easily extract text.

def main():
    assets = {
        "financial_models": [],
        "bank_documents": [],
        "legal_contracts": [],
        "company_incorporation": [],
        "pitch_decks": [],
        "other_interesting": []
    }
    
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            path = os.path.join(root, file)
            lower_name = file.lower()
            lower_root = root.lower()
            
            if 'model' in lower_name or 'model' in lower_root or 'plan' in lower_name or file.endswith('.xlsx'):
                assets["financial_models"].append(path)
            elif 'bank' in lower_name or 'bank' in lower_root or 'invoice' in lower_name:
                assets["bank_documents"].append(path)
            elif 'contract' in lower_name or 'contract' in lower_root or 'nda' in lower_name or 'agreement' in lower_name:
                assets["legal_contracts"].append(path)
            elif 'incorporation' in lower_name or 'license' in lower_name or 'cr ' in lower_name or 'misa' in lower_root or 'zacta' in lower_root or 'certificat' in lower_name:
                assets["company_incorporation"].append(path)
            elif 'deck' in lower_name or 'deck' in lower_root or 'presentation' in lower_name or file.endswith('.pptx'):
                assets["pitch_decks"].append(path)
            elif file.endswith('.txt') or file.endswith('.md') or file.endswith('.csv'):
                assets["other_interesting"].append(path)

    with open("asset_summary.json", "w", encoding='utf-8') as f:
        json.dump(assets, f, indent=2)
    print("Asset summary saved to asset_summary.json")

    # Read txt files
    for txt_file in assets["other_interesting"]:
        if txt_file.endswith('.txt'):
            try:
                with open(txt_file, 'r', encoding='utf-8', errors='ignore') as f:
                    print(f"\n--- Content of {txt_file} ---")
                    print(f.read()[:1000]) # print first 1000 chars
            except Exception as e:
                print(f"Error reading {txt_file}: {e}")

if __name__ == "__main__":
    main()
