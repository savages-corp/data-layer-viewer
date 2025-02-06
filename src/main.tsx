import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from './App'

// Find all viewers and render the app in them.
const viewers = document.querySelectorAll('.data-layer-viewer') 

viewers.forEach((viewer) => {
    createRoot(viewer).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
})
