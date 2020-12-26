ffmpeg -i %1 -c:v libvpx-vp9 -crf 20 -b:v 0 -c:a libvorbis "%2.webm"
