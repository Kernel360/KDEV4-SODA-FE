import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/layout/Layout'
import {
  Login,
  FindId,
  ResetPassword,
  UserInfo,
  AdminMain,
  ProjectList,
  CreateProject,
  Project,
  EditProject,
  AccountList,
  AccountDetail,
  CreateAccount,
  CompanyList,
  Company,
  EditCompany,
  UserMain,
  UserProject,
  UserAccountDetail,
  CreateCompany,
  Article,
  CreateArticle,
  EditArticle,
  ReplyArticle,
  FindPassword
} from './pages'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import theme from './theme'
import { ToastProvider } from './contexts/ToastContext'
import CssBaseline from '@mui/material/CssBaseline'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ToastProvider>
          <Routes>
            {/* Auth routes without layout */}
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
                <Layout>
                  <Outlet />
                </Layout>
              }>
              <Route
                index
                element={<AdminMain />}
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
                element={<Project />}
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
                element={<AccountDetail isAdmin={true} />}
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
                path="companies/:id"
                element={<Company />}
              />
              <Route
                path="companies/create"
                element={<CreateCompany />}
              />
              <Route
                path="companies/:id/edit"
                element={<EditCompany />}
              />
            </Route>

            {/* User routes with layout */}
            <Route
              path="/user"
              element={
                <Layout>
                  <Outlet />
                </Layout>
              }>
              <Route
                index
                element={<UserMain />}
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
            </Route>
          </Routes>
        </ToastProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
