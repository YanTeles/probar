# Script PowerShell para extrair cores do PDF usando .NET
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName PresentationCore

Write-Host "Iniciando análise de cores do logo PDF..." -ForegroundColor Cyan

$pdfPath = "c:\Users\Usuario\Documents\GitHub\probar\assets\logo.pdf"

# Tentar usar PDFSharp ou método alternativo
# Primeiro, vamos tentar uma abordagem diferente usando Windows

# Instalar/usar bibliotecas necessárias
$pythonDir = Get-ChildItem "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\*" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1

if ($pythonDir) {
    $pythonExe = Join-Path $pythonDir "python.exe"
    if (Test-Path $pythonExe) {
        Write-Host "Python encontrado em: $pythonExe" -ForegroundColor Green
        
        # Criar script Python temporário
        $pythonScript = @'
import sys
from pathlib import Path
import os

# Instalar dependências
packages = ['pdf2image', 'Pillow', 'numpy', 'scikit-learn']
for pkg in packages:
    os.system(f'{sys.executable} -m pip install {pkg} -q 2>/dev/null')

from pdf2image import convert_from_path
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

pdf_path = r"c:\Users\Usuario\Documents\GitHub\probar\assets\logo.pdf"
image = convert_from_path(pdf_path)[0]

# Converter para RGB
if image.mode != 'RGB':
    image = image.convert('RGB')

# Resize
image.thumbnail((150, 150))

# Extrair pixels
pixels = np.array(image).reshape((-1, 3))

# KMeans
kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
kmeans.fit(pixels)
colors = kmeans.cluster_centers_.astype(int)

# Imprimir resultado
print("\n" + "="*60)
print("ANÁLISE DE CORES DO LOGO PDF")
print("="*60)

color_types = ["Primária", "Secundária", "Terciária", "Complementar 1", "Complementar 2"]
print(f"\n{'Tipo':<20} {'HEX':<12} {'RGB':<30}")
print("-"*65)

for i, color in enumerate(colors):
    hex_code = rgb_to_hex(color)
    rgb_code = f"RGB({color[0]}, {color[1]}, {color[2]})"
    color_type = color_types[i] if i < len(color_types) else f"Cor {i+1}"
    print(f"{color_type:<20} {hex_code:<12} {rgb_code:<30}")

print("="*60)
'@
        
        # Salvar script Python
        $scriptPath = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.py'
        Set-Content -Path $scriptPath -Value $pythonScript -Encoding UTF8
        
        Write-Host "Executando análise de cores..." -ForegroundColor Yellow
        & $pythonExe $scriptPath 2>$null
        
        # Limpar
        Remove-Item -Path $scriptPath -ErrorAction SilentlyContinue
        exit
    }
}

# Se Python não foi encontrado, tentar segunda abordagem
Write-Host "Python não encontrado. Tentando alternativa..." -ForegroundColor Yellow

# Usar alternativa com ferramentas online ou sugestão
Write-Host ""
Write-Host "Para analisar o PDF e extrair cores, você precisa de:" -ForegroundColor Yellow
Write-Host "1. Python instalado, OU"
Write-Host "2. Uma ferramenta online para análise de cores" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opções:"  -ForegroundColor Cyan
Write-Host "  • Instalar Python: https://www.python.org/downloads/"
Write-Host "  • Usar ferramenta online: https://coolors.co/ ou similar"
Write-Host ""
