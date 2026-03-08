#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
from pathlib import Path

# Verificar e instalar dependências necessárias
required_packages = {
    'pdf2image': 'pdf2image',
    'PIL': 'Pillow',
    'numpy': 'numpy',
    'sklearn': 'scikit-learn'
}

for module, package in required_packages.items():
    try:
        __import__(module)
    except ImportError:
        print(f"Instalando {package}...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

from pdf2image import convert_from_path
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
from collections import Counter

def pdf_to_image(pdf_path):
    """Converter PDF para imagem"""
    print(f"Convertendo PDF para imagem...")
    images = convert_from_path(pdf_path)
    return images[0]  # Retornar primeira página

def hex_to_rgb(hex_color):
    """Converter HEX para RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    """Converter RGB para HEX"""
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def get_dominant_colors(image, num_colors=5):
    """Extrair cores dominantes da imagem"""
    print(f"Extraindo cores dominantes...")
    
    # Converter para RGB se necessário
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize para acelerar processamento
    image.thumbnail((200, 200))
    
    # Converter para array numpy
    image_array = np.array(image)
    pixels = image_array.reshape((-1, 3))
    
    # Aplicar KMeans
    kmeans = KMeans(n_clusters=num_colors, random_state=42, n_init=10)
    kmeans.fit(pixels)
    
    # Obter cores e labels
    colors = kmeans.cluster_centers_.astype(int)
    labels = kmeans.labels_
    
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
    
    # Converter PDF para imagem
    image = pdf_to_image(str(pdf_path))
    
    # Extrair cores dominantes
    dominant_colors = get_dominant_colors(image, num_colors=5)
    
    print("\n" + "="*60)
    print("ANÁLISE DE CORES DO LOGO")
    print("="*60)
    
    color_names = {
        0: "Primária",
        1: "Secundária",
        2: "Terciária",
        3: "Complementar 1",
        4: "Complementar 2"
    }
    
    results = []
    
    for idx, (rgb, count) in enumerate(dominant_colors):
        hex_code = rgb_to_hex(rgb)
        percentage = (count / sum(c[1] for c in dominant_colors)) * 100
        color_role = color_names.get(idx, f"Cor {idx+1}")
        
        result = {
            'posicao': idx + 1,
            'tipo': color_role,
            'hex': hex_code,
            'rgb': f"RGB({rgb[0]}, {rgb[1]}, {rgb[2]})",
            'percentual': f"{percentage:.1f}%"
        }
        results.append(result)
        
        print(f"\n{color_role} ({idx+1}):")
        print(f"  HEX:     {hex_code}")
        print(f"  RGB:     RGB({rgb[0]}, {rgb[1]}, {rgb[2]})")
        print(f"  Uso:     {percentage:.1f}%")
    
    print("\n" + "="*60)
    print("RESUMO EM FORMATO TABULAR:")
    print("="*60)
    print(f"{'Tipo':<15} {'HEX':<10} {'RGB':<25} {'Uso':<10}")
    print("-"*65)
    
    for result in results:
        print(f"{result['tipo']:<15} {result['hex']:<10} {result['rgb']:<25} {result['percentual']:<10}")
    
    print("="*60 + "\n")
    
    return results

if __name__ == "__main__":
    pdf_path = r"c:\Users\Usuario\Documents\GitHub\probar\assets\logo.pdf"
    analyze_logo(pdf_path)
