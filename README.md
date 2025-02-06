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
| `data-locked` | Locks the Data Layer Viewer in place so it doesn't move when scrolling |
