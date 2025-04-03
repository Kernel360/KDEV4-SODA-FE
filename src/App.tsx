import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import MyPage from './pages/profile/MyPage'
import { AdminMain } from './pages/admin'
import {
  ProjectList,
  Project,
  EditProject,
  CreateProject
} from './pages/admin/projects'
import { AccountList, CreateAccount } from './pages/admin/accounts'
import {
  CompanyList,
  Company,
  CreateCompany,
  EditCompany
} from './pages/admin/companies'
import { UserMain } from './pages/user'
import { UserProjectList, UserProject } from './pages/user/projects'
import { Article, CreateArticle, EditArticle } from './pages/article'
import { Login, ResetPassword, UserInfo } from './pages/auth'

const App: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route
        path="/login"
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

      {/* Routes with layout */}
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/mypage"
        element={
          <Layout>
            <MyPage />
          </Layout>
        }
      />

      {/* 관리자 페이지 */}
      <Route
        path="/admin"
        element={
          <Layout>
            <AdminMain />
          </Layout>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <Layout>
            <ProjectList />
          </Layout>
        }
      />
      <Route
        path="/admin/projects/create"
        element={
          <Layout>
            <CreateProject />
          </Layout>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <Layout>
            <Project />
          </Layout>
        }
      />
      <Route
        path="/admin/projects/:id/edit"
        element={
          <Layout>
            <EditProject />
          </Layout>
        }
      />
      <Route
        path="/admin/accounts"
        element={
          <Layout>
            <AccountList />
          </Layout>
        }
      />
      <Route
        path="/admin/accounts/create"
        element={
          <Layout>
            <CreateAccount />
          </Layout>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <Layout>
            <CompanyList />
          </Layout>
        }
      />
      <Route
        path="/admin/companies/:id"
        element={
          <Layout>
            <Company />
          </Layout>
        }
      />
      <Route
        path="/admin/companies/create"
        element={
          <Layout>
            <CreateCompany />
          </Layout>
        }
      />
      <Route
        path="/admin/companies/:id/edit"
        element={
          <Layout>
            <EditCompany />
          </Layout>
        }
      />

      {/* 고객사/개발사 */}
      <Route
        path="/user"
        element={
          <Layout>
            <UserMain />
          </Layout>
        }
      />
      <Route
        path="/user/projects"
        element={
          <Layout>
            <UserProjectList />
          </Layout>
        }
      />
      <Route
        path="/user/projects/:id"
        element={
          <Layout>
            <UserProject />
          </Layout>
        }
      />
      <Route
        path="/article/create"
        element={
          <Layout>
            <CreateArticle />
          </Layout>
        }
      />
      <Route
        path="/article/:id"
        element={
          <Layout>
            <Article />
          </Layout>
        }
      />
      <Route
        path="/article/:id/edit"
        element={
          <Layout>
            <EditArticle />
          </Layout>
        }
      />
    </Routes>
  )
}

export default App
