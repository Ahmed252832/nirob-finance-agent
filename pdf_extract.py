import sys,json
from pathlib import Path
import pymupdf as fitz
path=Path(sys.argv[1]);doc=fitz.open(path)
if len(doc)>10:raise ValueError('Maximum 10 PDF pages')
text='\n'.join(page.get_text() for page in doc)
images=[]
if len(text.strip())<40:
    for i,page in enumerate(doc):
        if i>=3:break
        target=path.with_name(path.stem+f'-{i}.png');page.get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(target);images.append(str(target))
print(json.dumps({'text':text[:30000],'images':images}))
