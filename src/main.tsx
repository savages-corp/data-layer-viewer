import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

// Find all viewers and render the app in them.
const viewers = document.querySelectorAll('.data-layer-viewer')

viewers.forEach((viewer) => {
  // Get the various data attributes to be passed as props.
  const locked = viewer.getAttribute('data-locked') === 'true'
  const hideControls = viewer.getAttribute('data-hide-controls') === 'true'
  const hideMinimap = viewer.getAttribute('data-hide-minimap') === 'true'

  createRoot(viewer).render(
    <StrictMode>
      <App hideControls={hideControls} hideMinimap={hideMinimap} locked={locked} />
    </StrictMode>,
  )
})
