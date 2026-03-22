# Embedding in Canvas LMS

## Basic Iframe

After deploying to Netlify, embed the Player using an iframe in Canvas:

```html
<iframe
  src="https://your-module.netlify.app"
  width="100%"
  height="700"
  style="border: none; border-radius: 12px;"
  allow="scripts"
  sandbox="allow-scripts allow-same-origin"
  title="OTC Training Module"
></iframe>
```

## Canvas Rich Content Editor

1. Open the Canvas page or assignment
2. Click **Edit** → switch to HTML editor (Source Code button)
3. Paste the iframe code above, replacing the `src` with your Netlify URL
4. Save the page

## Required Sandbox Attributes

The following `sandbox` values are required for the Player to function:

| Attribute | Why it's needed |
|-----------|-----------------|
| `allow-scripts` | Required to run React and the interactive quiz logic |
| `allow-same-origin` | Required to load module assets (images, JS chunks) from the same origin |

## Responsive Sizing

For mobile-friendly embedding, use a percentage width and fixed minimum height:

```html
<iframe
  src="https://your-module.netlify.app"
  style="width: 100%; min-height: 600px; border: none;"
  sandbox="allow-scripts allow-same-origin"
  title="OTC Training Module"
></iframe>
```

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| Blank iframe | Missing `allow-scripts` | Add `sandbox="allow-scripts allow-same-origin"` |
| Quiz shows demo data | Wrong Netlify URL | Ensure URL points to the deployed module folder |
| Images not loading | CSP restriction | Check Canvas CSP settings with your LMS admin |
| Score not saving | Expected — scores are session-only | No fix needed; scores reset on page reload |
