Drop logo files here, then set the `logo` field on the tool entry in data.js.

Naming convention:  <tool-id>.<ext>
  e.g.  vllm-serve.png   mlperf.svg   guidellm.png

Recommended format:  SVG (scales perfectly) or PNG with transparent background
Recommended size:    128×128 px (square, or square crop)

Example data.js entry:
  {
    id: 'my-tool',
    logo: 'logos/my-tool.svg',   // <-- add this line; omit to show initials instead
    ...
  }
