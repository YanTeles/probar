# Script para extrair cores do logo PDF usando ImageMagick e PowerShell
$ErrorActionPreference = 'Stop'

$pdfPath = "c:\Users\Usuario\Documents\GitHub\probar\assets\logo.pdf"
$imagePath = "c:\Users\Usuario\Documents\GitHub\probar\assets\logo_temp.png"
$outputPath = "c:\Users\Usuario\Documents\GitHub\probar\colors_analysis.txt"

Write-Host "Iniciando análise de cores do logo..." -ForegroundColor Cyan

# Converter PDF para PNG usando ImageMagick
Write-Host "Convertendo PDF para PNG..." -ForegroundColor Yellow
try {
    convert "$pdfPath" -background white -flatten "$imagePath"
    Write-Host "PDF convertido com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao converter PDF: $_" -ForegroundColor Red
    exit 1
}

# Usar ImageMagick para extrair histogram/cores
Write-Host "Analisando cores da imagem..." -ForegroundColor Yellow

# Obter estatísticas de cores usando convert
$colorStats = convert "$imagePath" -colors 10 -format "%c" histogram:info: 2>$null

# Extrair 5 cores dominantes usando um método alternativo
$dominantColors = convert "$imagePath" `
    -format "%c" `
    -colors 5 `
    -depth 8 `
    histogram:info: 2>$null

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "ANÁLISE DE CORES DO LOGO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Processar resultado
if ($dominantColors) {
    $lines = $dominantColors -split "`n" | Where-Object { $_.Trim() -ne "" }
    
    $colorCount = 0
    $colorNames = @("Primária", "Secundária", "Terciária", "Complementar 1", "Complementar 2")
    $totalPixels = 0
    $colors = @()
    
    # Extrair cores e contar
    foreach ($line in $lines) {
        if ($line -match '(\d+):\s*\(\s*(\d+),\s*(\d+),\s*(\d+)') {
            $pixels = [int]$matches[1]
            $r = [int]$matches[2]
            $g = [int]$matches[3]
            $b = [int]$matches[4]
            $totalPixels += $pixels
            
            $colors += @{
                pixels = $pixels
                r = $r
                g = $g
                b = $b
                hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
            }
        }
    }
    
    # Ordenar por frequência
    $colors = $colors | Sort-Object -Property pixels -Descending | Select-Object -First 5
    
    $colors | ForEach-Object { [pscustomobject]$_ } | ConvertTo-Json | Out-Host
    
    Write-Host ""
    Write-Host "Cores Dominantes Encontradas:" -ForegroundColor Cyan
    Write-Host "-" * 65
    
    for ($i = 0; $i -lt $colors.Count; $i++) {
        $color = $colors[$i]
        $percentage = if ($totalPixels -gt 0) { [math]::Round(($color.pixels / $totalPixels * 100), 1) } else { 0 }
        $colorRole = if ($i -lt $colorNames.Count) { $colorNames[$i] } else { "Cor $(i+1)" }
        
        Write-Host ""
        Write-Host "$($colorRole) ($($i + 1)):" -ForegroundColor Green
        Write-Host "  HEX:     $($color.hex)" -ForegroundColor Yellow
        Write-Host "  RGB:     RGB($($color.r), $($color.g), $($color.b))"
        Write-Host "  Uso:     $($percentage)%"
    }
} else {
    Write-Host "Erro ao analisar cores." -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan

# Limpar arquivo temporário
Remove-Item -Path $imagePath -ErrorAction SilentlyContinue

Write-Host "Análise concluída!" -ForegroundColor Green
