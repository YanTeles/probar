# Script PowerShell para análise de cores do PDF usando .NET diretamente
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName PresentationCore

Write-Host "Analisando logo PDF usando .NET..." -ForegroundColor Cyan

$pdfPath = "c:\Users\Usuario\Documents\GitHub\probar\assets\logo.pdf"

# Verificar se arquivo existe
if (-not (Test-Path $pdfPath)) {
    Write-Host "Erro: Arquivo não encontrado: $pdfPath" -ForegroundColor Red
    exit 1
}

# Tentar carregar PDF como documento
try {
    # Usar PresentationCore para carregar PNG do PDF
    # Como alternativa, vamos usar WPF ImageBrush
    
    # Criar um ImageBrush para ler a imagem
    [System.Windows.Media.Imaging.BitmapImage]$bitmap = New-Object System.Windows.Media.Imaging.BitmapImage
    $bitmap.BeginInit()
    $bitmap.UriSource = New-Object System.Uri($pdfPath)
    $bitmap.EndInit()
    
    # Se falhar, tentar outra abordagem
    Write-Host "PDF carregado com PresentationCore" -ForegroundColor Green
    
} catch {
    Write-Host "Erro ao carregar PDF com PresentationCore: $_" -ForegroundColor Yellow
}

# Tentar abrir o arquivo como OLE
try {
    $shell = New-Object -COM Shell.Application
    $file = $shell.CreateLink($pdfPath)
    Write-Host "Arquivo acessível via COM: $($file.FullName)" -ForegroundColor Green
} catch {
    Write-Host "Arquivo não é acessível via COM" -ForegroundColor Gray
}

Write-Host ""
Write-Host "SOLUÇÃO ALTERNATIVA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para analisar as cores do logo PDF, recomendo uma das seguintes opções:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPÇÃO 1: Instalar Python via Microsoft Store"  -ForegroundColor Green
Write-Host "  Comando: python (isso abrirá o Microsoft Store para instalar)"
Write-Host "  Depois executar: pip install pdf2image pillow numpy scikit-learn"
Write-Host ""
Write-Host "OPÇÃO 2: Usar ferramenta online"  -ForegroundColor Green
Write-Host "  1. Abra https://www.canva.com/colors/color-palette/"
Write-Host "  2. Upload da imagem/PDF"
Write-Host "  3. Extrair as cores automaticamente"
Write-Host ""
Write-Host "OPÇÃO 3: Usar VS Code com extensão"  -ForegroundColor Green
Write-Host "  1. Procure por 'Color Picker' ou 'Color Extractor' na VS Code"
Write-Host "  2. Abra o PDF como imagem"
Write-Host "  3. Use a extensão para extrair cores"
Write-Host ""
Write-Host "OPÇÃO 4: Verificar acesso ao arquivo"  -ForegroundColor Green
Write-Host "  1. Abra o arquivo em um leitor de PDF"
Write-Host "  2. Identifique visualmente as cores principais"
Write-Host "  3. Use ferramentas como:"
Write-Host "     - https://imagecolorpicker.com/"
Write-Host "     - https://chir.ag/projects/ntc.js/"
Write-Host ""

# Tentar descrição visual
Write-Host "="*60 -ForegroundColor Cyan
Write-Host "ANÁLISE DO ARQUIVO:" -ForegroundColor Cyan
Write-Host "="*60

Get-Item $pdfPath | Select-Object Name, Length, LastWriteTime | Format-List
