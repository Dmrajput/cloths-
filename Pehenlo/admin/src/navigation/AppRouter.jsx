import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import UsersPage from '../pages/users/UsersPage'
import UserDetailsPage from '../pages/users/UserDetailsPage'
import ListingsPage from '../pages/listings/ListingsPage'
import ListingDetailsPage from '../pages/listings/ListingDetailsPage'
import BookingsPage from '../pages/bookings/BookingsPage'
import PaymentsPage from '../pages/payments/PaymentsPage'
import PayoutsPage from '../pages/payouts/PayoutsPage'
import DisputesPage from '../pages/disputes/DisputesPage'
import CategoriesPage from '../pages/categories/CategoriesPage'

function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <Link to="/">Dashboard</Link>
        <Link to="/users">Users</Link>
        <Link to="/listings">Listings</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/payments">Payments</Link>
        <Link to="/payouts">Payouts</Link>
        <Link to="/disputes">Disputes</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/login">Login</Link>
      </nav>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailsPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payouts" element={<PayoutsPage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default AppRouter
