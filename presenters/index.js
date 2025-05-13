// Index page presenter
export function formatIndexPage(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
</head>
<body>
  <h1>${content.title}</h1>
  <button id="check">Check Status</button>
  <pre id="result">Click button to check status</pre>

  <script>
    document.getElementById('check').addEventListener('click', async () => {
      const result = document.getElementById('result');
      result.textContent = 'Checking...';
      const response = await fetch('${content.features[0].endpoint}');
      const data = await response.json();
      result.textContent = JSON.stringify(data, null, 2);
    });
  </script>
</body>
</html>`;
} 