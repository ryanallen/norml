@echo off
if exist index.html (
  del index.html
  echo Removed GitHub-generated index.html from root directory
) else (
  echo No index.html found in root directory
) 