#!/bin/bash

# Script para extraer un frame del video como thumbnail
# Requiere ffmpeg instalado

VIDEO_PATH="public/videos/Kraft_Singles_Commercial_Script.mp4"
OUTPUT_PATH="public/videos/kraft-singles-thumbnail.jpg"

# Verificar si ffmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg no está instalado."
    echo ""
    echo "Para instalar en macOS:"
    echo "  brew install ffmpeg"
    echo ""
    echo "O usa una herramienta online:"
    echo "  https://www.freeconvert.com/video-to-jpg"
    exit 1
fi

# Extraer frame en el segundo 2 (ajusta el tiempo si quieres otro frame)
echo "📸 Extrayendo frame del video..."
ffmpeg -i "$VIDEO_PATH" -ss 00:00:02 -vframes 1 -q:v 2 "$OUTPUT_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Thumbnail creado: $OUTPUT_PATH"
    echo ""
    echo "Ahora actualiza el atributo 'poster' en page.tsx a:"
    echo "  poster=\"/videos/kraft-singles-thumbnail.jpg\""
else
    echo "❌ Error al extraer el frame"
    exit 1
fi

