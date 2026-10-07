import urllib.request
import re

html = urllib.request.urlopen('http://localhost:3000').read().decode('utf-8')
links = re.findall(r'href="(/_next/static/chunks/[^"]+\.css)"', html)
print('Found CSS links:', links)
for l in links:
    data = urllib.request.urlopen('http://localhost:3000' + l).read().decode('utf-8')
    print(f'{l}: {len(data)} bytes')
    print(f'Contains Tailwind classes: flex={ "display: flex" in data or "flex" in data }, bg-white={ "bg-white" in data }')
