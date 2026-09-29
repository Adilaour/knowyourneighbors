import { Navigate, Route, Routes } from 'react-router-dom'
import MapPage from './pages/MapPage'
import ListPage from './pages/ListPage'
import AdminContactListPage from './pages/AdminContactListPage'
import AdminHouseEditorPage from './pages/AdminHouseEditorPage'
import SettingsPage from './pages/SettingsPage'
import ContactForm from './components/admin/ContactForm'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" replace />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/contacts" element={<ListPage />} />
      <Route path="/admin/contacts" element={<AdminContactListPage />} />
      <Route path="/admin/contacts/new" element={<ContactForm />} />
      <Route path="/admin/contacts/:id/edit" element={<ContactForm />} />
      <Route path="/admin/houses" element={<AdminHouseEditorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}
