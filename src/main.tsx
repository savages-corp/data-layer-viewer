import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

// Find all viewers and render the app in them.
const viewers = document.querySelectorAll('.data-layer-viewer')

viewers.forEach((viewer) => {
  // Get the various data attributes to be passed as props.
  const controls = viewer.getAttribute('data-controls') === 'true'
  const locked = viewer.getAttribute('data-locked') === 'true'
  const minimap = viewer.getAttribute('data-minimap') === 'true'

  createRoot(viewer).render(
    <StrictMode>
      <App controls={controls} locked={locked} minimap={minimap} />
    </StrictMode>,
  )
})
