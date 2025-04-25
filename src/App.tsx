import React from 'react'
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import {
  Login,
  FindId,
  FindPassword,
  ResetPassword,
  UserInfo,
  AdminMain,
  ProjectList,
  ProjectDetail,
  EditProject,
  CreateProject,
  AccountList,
  AccountDetail,
  CreateAccount,
  CompanyList,
  Company,
  EditCompany,
  CreateCompany,
  UserProject,
  UserAccountDetail,
  Article,
  CreateArticle,
  EditArticle,
  ReplyArticle
} from './pages'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import theme from './theme'
import { ToastProvider } from './contexts/ToastContext'
import CssBaseline from '@mui/material/CssBaseline'
import UserProfile from './pages/user/UserProfile'
import TaskDetailPage from './pages/tasks/TaskDetailPage'
import CreateRequest from './pages/user/projects/CreateRequest'
import UserDashboard from './pages/user/UserDashboard'
import RequestList from './pages/user/RequestList'
import RecentPosts from './pages/user/MyArticles'
import Projects from './pages/user/Projects'
import RequestDetail from './pages/user/projects/RequestDetail'
import DataManagement from './pages/admin/DataManagement'
import ReapplyRequest from './pages/user/projects/ReapplyRequest'
import UserRequests from './pages/user/UserRequests'
import MyArticles from './pages/user/MyArticles'
import PrivateRoute from './components/auth/PrivateRoute'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={<Login />}
            />
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/find-id"
              element={<FindId />}
            />
            <Route
              path="/find-password"
              element={<FindPassword />}
            />
            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />
            <Route
              path="/user-info"
              element={<UserInfo />}
            />

            {/* Admin routes with layout */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requireAdmin>
                  <Layout>
                    <Outlet />
                  </Layout>
                </PrivateRoute>
              }>
              <Route
                index
                element={<AdminMain />}
              />
              <Route
                path="additional-info"
                element={<UserInfo />}
              />
              <Route
                path="projects"
                element={<ProjectList />}
              />
              <Route
                path="projects/create"
                element={<CreateProject />}
              />
              <Route
                path="projects/:id"
                element={<ProjectDetail />}
              />
              <Route
                path="projects/:id/edit"
                element={<EditProject />}
              />
              <Route
                path="accounts"
                element={<AccountList />}
              />
              <Route
                path="accounts/:id"
                element={<AccountDetail />}
              />
              <Route
                path="accounts/create"
                element={<CreateAccount />}
              />
              <Route
                path="companies"
                element={<CompanyList />}
              />
              <Route
                path="companies/create"
                element={<CreateCompany />}
              />
              <Route
                path="companies/:id"
                element={<Company />}
              />
              <Route
                path="companies/:id/edit"
                element={<EditCompany />}
              />
              <Route
                path="data"
                element={<DataManagement />}
              />
            </Route>

            {/* User routes with layout */}
            <Route
              path="/user"
              element={
                <PrivateRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </PrivateRoute>
              }>
              <Route
                index
                element={<UserDashboard />}
              />
              <Route
                path="additional-info"
                element={<UserInfo />}
              />
              <Route
                path="requests"
                element={<UserRequests />}
              />
              <Route
                path="articles"
                element={<MyArticles />}
              />
              <Route
                path="projects"
                element={<Projects />}
              />
              <Route
                path="projects/:id"
                element={<UserProject />}
              />
              <Route
                path="projects/:projectId/articles/:articleId"
                element={<Article />}
              />
              <Route
                path="projects/:projectId/articles/create"
                element={<CreateArticle />}
              />
              <Route
                path="projects/:projectId/articles/:articleId/edit"
                element={<EditArticle />}
              />
              <Route
                path="projects/:projectId/articles/:articleId/reply"
                element={<ReplyArticle />}
              />
              <Route
                path="accounts/:id"
                element={<UserAccountDetail isAdmin={false} />}
              />
              <Route
                path=":id"
                element={<UserProfile />}
              />
              <Route
                path="projects/:projectId/requests/create"
                element={<CreateRequest />}
              />
              <Route
                path="projects/:projectId/requests/:requestId"
                element={<RequestDetail />}
              />
              <Route
                path="projects/:projectId/requests/:requestId/reapply"
                element={<ReapplyRequest />}
              />
            </Route>

            <Route
              path="/projects/:projectId/tasks/:taskId"
              element={<TaskDetailPage />}
            />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/user"
                  replace
                />
              }
            />
          </Routes>
        </ToastProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
