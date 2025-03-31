import { Route, Routes } from 'react-router-dom'
import {
  AccountListPage,
  AdminMainPage,
  ArticlePage,
  CompanyListPage,
  CompanyPage,
  CreateAccountPage,
  CreateArticlePage,
  CreateCompanyPage,
  CreateProjectPage,
  EditArticlePage,
  EditCompanyPage,
  EditProjectPage,
  LoginPage,
  ProjectListPage,
  ProjectPage,
  UserMainPage,
  UserProjectListPage,
  UserProjectPage
} from './pages'

export default function App() {
  return (
    <Routes>
      {/* 메인 페이지(로그인 페이지) */}
      <Route
        path=""
        element={<LoginPage />}
      />

      {/* 관리자 페이지 */}
      <Route
        path="/admin"
        element={<AdminMainPage />}
      />
      <Route
        path="/admin/projects"
        element={<ProjectListPage />}
      />
      <Route
        path="/admin/projects/create"
        element={<CreateProjectPage />}
      />
      <Route
        path="/admin/projects/:id"
        element={<ProjectPage />}
      />
      <Route
        path="/admin/projects/:id/edit"
        element={<EditProjectPage />}
      />
      <Route
        path="/admin/accounts"
        element={<AccountListPage />}
      />
      <Route
        path="/admin/accounts/create"
        element={<CreateAccountPage />}
      />
      <Route
        path="/admin/companies"
        element={<CompanyListPage />}
      />
      <Route
        path="/admin/companies/:id"
        element={<CompanyPage />}
      />
      <Route
        path="/admin/companies/create"
        element={<CreateCompanyPage />}
      />
      <Route
        path="/admin/companies/:id/edit"
        element={<EditCompanyPage />}
      />

      {/* 고객사/개발사 */}
      <Route
        path="/user"
        element={<UserMainPage />}
      />
      <Route
        path="/user/projects"
        element={<UserProjectListPage />}
      />
      <Route
        path="/user/projects/:id"
        element={<UserProjectPage />}
      />
      <Route
        path="/article/create"
        element={<CreateArticlePage />}
      />
      <Route
        path="/article/:id"
        element={<ArticlePage />}
      />
      <Route
        path="/article/:id/edit"
        element={<EditArticlePage />}
      />
    </Routes>
  )
}
