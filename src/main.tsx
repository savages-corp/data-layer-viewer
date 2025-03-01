import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { LocaleProvider } from './components/Core/Ti18nProvider'

// Find all viewers and render the app in them.
const viewers = document.querySelectorAll('.data-layer-viewer')

viewers.forEach((viewer) => {
  // Get the various data attributes to be passed as props.
  const locale = viewer.getAttribute('data-locale') || 'en'
  const locked = viewer.getAttribute('data-locked') === 'true'
  const hideControls = viewer.getAttribute('data-hide-controls') === 'true'
  const hideMinimap = viewer.getAttribute('data-hide-minimap') === 'true'
  const tutorial = viewer.getAttribute('data-tutorial') === 'true'

  createRoot(viewer).render(
    <StrictMode>
      <LocaleProvider locale={locale}>
        <App hideControls={hideControls} hideMinimap={hideMinimap} locked={locked} tutorial={tutorial} />
      </LocaleProvider>
    </StrictMode>,
  )
})
