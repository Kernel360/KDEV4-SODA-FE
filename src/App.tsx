import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/layout/Layout'
import {
  Login,
  ResetPassword,
  UserInfo,
  AdminMain,
  ProjectList,
  CreateProject,
  Project,
  EditProject,
  AccountList,
  CreateAccount,
  CompanyList,
  Company,
  EditCompany,
  UserMain,
  UserProject
} from './pages'

const App: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route
        path="/"
        element={<Login />}
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
      </Route>
    </Routes>
  )
}

export default App
