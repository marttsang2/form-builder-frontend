import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@/index.css'
import App from '@/App.tsx'
import HomePage from '@/pages/forms/HomePage'
import FormResponsePage from '@/pages/forms/FormResponsePage'
import FormCreatePage from '@/pages/forms/FormCreatePage'
import SurveyPage from '@/pages/forms/SurveyPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'forms/:formId/responses',
        element: <FormResponsePage />
      },
      {
        path: 'forms/new',
        element: <FormCreatePage />
      },
      {
        path: 'forms/:formId/survey',
        element: <SurveyPage />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
