export interface Company {
  id: number
  name: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailAddress: string
}

export interface User {
  id: number
  memberId: number
  authId: string
  name: string
  email: string
  phoneNumber: string
  position: string
  role: string
  firstLogin: boolean
  company?: {
    id: number
    name: string
    phoneNumber: string
    companyNumber: string
  }
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  code?: string
  data: T
}

export interface LoginResponse {
  token: string
  data: {
    memberId: number
    name: string
    authId: string
    position: string
    phoneNumber: string
    role: string
    firstLogin: boolean
    company?: Company
  }
}

export interface LoginRequest {
  authId: string
  password: string
}

export interface FindIdRequest {
  name: string
  email: string
}

export interface FindIdResponse {
  maskedAuthId: string
}

export interface RequestPasswordResetRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface ResetPasswordRequest {
  email: string
  newPassword: string
}

export interface CompanyCreateRequest {
  name: string
  phoneNumber: string
  ownerName: string
  companyNumber: string
  address: string
  detailaddress: string
}

export interface CompanyCreateResponse {
  status: 'success' | 'error'
  code: string
  message: string
  data: {
    id: number
    name: string
    phoneNumber: string
    ownerName: string
    companyNumber: string
    address: string
    detailaddress: string
  } | null
}

export interface CompanyListItem {
  id: number
  name: string
  businessNumber: string
  phoneNumber: string
  companyNumber: string
  address: string
  detailAddress: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: {
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    empty: boolean
  }
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export type CompanyListResponse = ApiResponse<
  PaginatedResponse<CompanyListItem>
>

export interface SignupRequest {
  name: string
  authId: string
  password: string
  role: 'USER' | 'ADMIN'
  companyId?: number | null
}

export interface SignupResponse {
  status: 'success' | 'error'
  code: string
  message: string
  data: null
}

export interface CompanyMember {
  id: number
  authId: string
  name: string
  position: string | null
  phoneNumber: string | null
  role: 'USER' | 'ADMIN' | '담당자' | '일반'
}

export interface CompanyMemberListResponse {
  status: 'success' | 'error'
  code: string
  message: string
  data: CompanyMember[]
}

export interface TaskRequest {
  requestId: number
  title: string
  content: string
  status: string
  memberName: string
  createdAt: string
  links: Array<{
    id: number
    urlAddress: string
    urlDescription: string
  }>
  files: Array<{
    id: number
    url: string
    name?: string
  }>
  newFiles?: Array<{
    id: number
    name: string
    inputId: string
  }>
}

export interface TaskRequestsResponse extends ApiResponse<TaskRequest[]> {}

export interface ProjectStageTask {
  taskId: number
  projectId: number
  stageId: number
  title: string
  content: string
  taskOrder: number
  status: 'PENDING' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED'
  links: Array<{
    id: number
    urlAddress: string
    urlDescription: string
  }>
  files: Array<{
    id: number
    url: string
    name?: string
  }>
}

export interface ProjectStage {
  id: number
  name: string
  stageOrder: number
  tasks: ProjectStageTask[]
}

export interface ProjectStagesResponse extends ApiResponse<ProjectStage[]> {}

export interface CreateTaskRequestRequest {
  title: string
  content: string
  projectId: number
  stageId: number
  taskId: number
  links: Array<{
    urlAddress: string
    urlDescription: string
  }>
}

export interface CreateTaskRequestResponse {
  status: string
  code: string
  message: string
  data?: {
    requestId: number
    title: string
    content: string
    status: string
    links: Array<{
      id: number
      urlAddress: string
      urlDescription: string
    }>
  }
}

export interface MemberListDto {
  id: number
  authId: string
  name: string
  email: string | null
  role: 'USER' | 'ADMIN'
  company: string | null
  position: string | null
  createdAt: string
  updatedAt: string
  deleted: boolean
}

export interface PagedData<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface TaskResponse {
  responseId: number
  content: string
  links: Array<{
    linkId: number
    urlAddress: string
    urlDescription: string
  }>
  files: Array<{
    fileId: number
    fileName: string
    fileUrl: string
  }>
  createdAt: string
  updatedAt: string
}

export interface CreateTaskResponseRequest {
  content: string
  links?: Array<{
    urlAddress: string
    urlDescription: string
  }>
}

export interface UpdateTaskResponseRequest {
  content: string
  links?: Array<{
    urlAddress: string
    urlDescription: string
  }>
}

export interface UpdateUserInfoResponse {
  status: 'success' | 'error'
  code: string
  message: string
  data: User | null
}
