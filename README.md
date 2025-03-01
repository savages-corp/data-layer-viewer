# Data Layer Viewer #

Front-end visualization of Data Layer flows for demo and debugging purposes.

## Getting Started ##

```bash
npm install
```

Get up and running with the development server:

```bash
npm run dev
```

While the development server is running, changes you make to the code will be
automatically reflected in the browser!

## Building ##

To create a bundle for embedding in a web page:

```bash
npm run build
```

This will emit a `bundle.js` file in the `dist/` directory which can be included on any site.

Make sure to name any div you want to render the Data Layer Viewer in with the class `data-layer-viewer`.

## Embedding Props ##

The following props are available for embedding the Data Layer Viewer:

| Prop | Description |
| --- | --- |
| `data-hide-controls` | Hides the controls (also hidden when locked) |
| `data-hide-minimap` | Hides the minimap (also hidden when locked) |
| `data-locale` | Sets the locale for the viewer (en, de) |
| `data-locked` | Locks the viewport in place |
| `data-tutorial` | Enables hints within the visualization |

## Why no Tailwind / Shadcn? ##

Due to this app being possibly embedded as a widget on other sites, we want to keep the bundle size as small as possible. Tailwind and Shadcn are great for development, but most of the styling can be done on top of the base ReactFlow styles with a few core React components thrown in to aid with specific functionality (i.e. react-select and react-modal for dropdowns and modals).
