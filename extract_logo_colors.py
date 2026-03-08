#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Script para extrair cores dominantes de um logo PDF usando PyMuPDF"""

import sys
from pathlib import Path

# Importar bibliotecas
try:
    import fitz  # PyMuPDF
except ImportError:
    print("Instalando PyMuPDF...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF", "-q"])
    import fitz

from PIL import Image
import numpy as np
from collections import Counter
from io import BytesIO

def rgb_to_hex(rgb):
    """Converter RGB para HEX"""
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def simple_kmeans(pixels, k=5, max_iter=100):
    """Implementação simples de KMeans sem scikit-learn"""
    # Garantir que temos dados suficientes
    if len(pixels) < k:
        k = len(pixels)
        print(f"Ajustando número de cores para {k} (menos pixels que clusters)")
    
    # Inicializar centróides aleatoriamente
    np.random.seed(42)
    indices = np.random.choice(len(pixels), k, replace=False)
    centroids = pixels[indices].astype(float)
    
    for iteration in range(max_iter):
        # Atribuir pontos aos centróides mais próximos
        distances = np.sqrt(((pixels - centroids[:, np.newaxis]) ** 2).sum(axis=2))
        labels = np.argmin(distances, axis=0)
        
        # Atualize centróides
        new_centroids = []
        for i in range(k):
            mask = labels == i
            if mask.sum() > 0:
                new_centroids.append(pixels[mask].mean(axis=0))
            else:
                new_centroids.append(centroids[i])
        new_centroids = np.array(new_centroids)
        
        # Verificar convergência
        if np.allclose(centroids, new_centroids):
            break
        
        centroids = new_centroids
    
    return centroids.astype(int), labels

def get_dominant_colors(image, num_colors=5):
    """Extrair cores dominantes da imagem"""
    # Converter para RGB se necessário
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize para acelerar processamento
    image.thumbnail((150, 150))
    
    # Converter para array numpy
    image_array = np.array(image)
    pixels = image_array.reshape((-1, 3))
    
    # KMeans simples
    colors, labels = simple_kmeans(pixels, k=num_colors)
    
    # Contar ocorrências
    label_counts = Counter(labels)
    
    # Ordenar por frequência
    sorted_colors = sorted(
        [(colors[i], label_counts[i]) for i in range(num_colors)],
        key=lambda x: x[1],
        reverse=True
    )
    
    return sorted_colors

def analyze_logo(pdf_path):
    """Analisar logo e extrair cores"""
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        print(f"Erro: Arquivo não encontrado: {pdf_path}")
        sys.exit(1)
    
    print(f"\nAbrindo PDF: {pdf_path.name}")
    
    try:
        # Abrir PDF e converter primeira página para imagem
        pdf = fitz.open(str(pdf_path))
        
        # Obter primeira página
        page = pdf[0]
        
        # Renderizar página como imagem PNG
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom para melhor qualidade
        image_data = pix.tobytes("png")
        
        # Converter para PIL Image
        image = Image.open(BytesIO(image_data))
        
        pdf.close()
        
    except Exception as e:
        print(f"Erro ao processar PDF: {e}")
        sys.exit(1)
    
    print(f"Extraindo cores dominantes...")
    # Extrair cores dominantes
    dominant_colors = get_dominant_colors(image, num_colors=5)
    
    print("\n" + "="*70)
    print("ANÁLISE DE CORES DO LOGO")
    print("="*70)
    
    color_names = [
        "Primária",
        "Secundária",
        "Terciária",
        "Complementar 1",
        "Complementar 2"
    ]
    
    total_pixels = sum(c[1] for c in dominant_colors)
    
    print(f"\n{'Rank':<6} {'Tipo':<20} {'HEX':<12} {'RGB':<35} {'Uso':<10}")
    print("-"*85)
    
    results = []
    
    for idx, (rgb, count) in enumerate(dominant_colors):
        hex_code = rgb_to_hex(rgb)
        percentage = (count / total_pixels * 100) if total_pixels > 0 else 0
        color_role = color_names[idx] if idx < len(color_names) else f"Cor {idx+1}"
        rgb_str = f"RGB({rgb[0]}, {rgb[1]}, {rgb[2]})"
        
        print(f"{idx+1:<6} {color_role:<20} {hex_code:<12} {rgb_str:<35} {percentage:.1f}%")
        
        results.append({
            'posicao': idx + 1,
            'tipo': color_role,
            'hex': hex_code,
            'rgb': rgb_str,
            'percentual': f"{percentage:.1f}%"
        })
    
    print("="*85)
    
    # Resumo em formato simples
    print("\nRESUMO DAS CORES ENCONTRADAS:")
    print("-"*85)
    for result in results:
        print(f"  {result['tipo']:20} | {result['hex']:12} | {result['rgb']:30} | {result['percentual']:>6}")
    
    print("="*85 + "\n")
    
    return results

if __name__ == "__main__":
    pdf_path = r"c:\Users\Usuario\Documents\GitHub\probar\assets\logo.pdf"
    analyze_logo(pdf_path)
