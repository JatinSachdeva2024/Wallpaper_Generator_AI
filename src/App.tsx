import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GenerationProvider } from './context/GenerationContext'
import { Layout } from './components/Layout'
import { NewPage } from './pages/NewPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryPage } from './pages/CategoryPage'
import { ExplorePage } from './pages/ExplorePage'
import { DetailPage } from './pages/DetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <GenerationProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<NewPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="explore" element={<ExplorePage />} />
        </Route>
        <Route path="wallpaper/:id" element={<DetailPage />} />
      </Routes>
      </GenerationProvider>
    </BrowserRouter>
  )
}
