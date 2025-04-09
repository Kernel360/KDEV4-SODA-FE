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
  name: string
  email: string
  phoneNumber: string
  position: string
  company: string
  role: string
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  code: string;
  message: string;
  data?: T;
}

export interface LoginResponse {
  token: string
  data: {
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
  name: string;
  email: string;
}

export interface FindIdResponse {
  maskedAuthId: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface CompanyCreateRequest {
  name: string;
  phoneNumber: string;
  ownerName: string;
  companyNumber: string;
  address: string;
  detailaddress: string;
}

export interface CompanyCreateResponse {
  status: 'success' | 'error';
  code: string;
  message: string;
  data: {
    id: number;
    name: string;
    phoneNumber: string;
    ownerName: string;
    companyNumber: string;
    address: string;
    detailaddress: string;
  } | null;
}

export interface CompanyListItem {
  id: number;
  name: string;
  phoneNumber: string;
  companyNumber: string;
  address: string;
  detailAddress: string | null;
}

export interface CompanyListResponse extends ApiResponse<CompanyListItem[]> {}

export interface SignupRequest {
  name: string;
  authId: string;
  password: string;
  role: 'USER' | 'ADMIN';
  companyId: number;
}

export interface SignupResponse {
  status: 'success' | 'error';
  code: string;
  message: string;
  data: null;
}

export interface CompanyMember {
  id: number
  authId: string
  name: string
  position: string | null
  phoneNumber: string | null
  role: 'USER' | 'ADMIN'
}

export interface CompanyMemberListResponse {
  status: 'success' | 'error'
  code: string
  message: string
  data: CompanyMember[]
}

export interface TaskRequest {
  requestId: number;
  taskId: number;
  memberId: number;
  memberName: string;
  title: string;
  content: string;
  links: {
    id: number;
    urlAddress: string;
    urlDescription: string;
  }[];
  files: any[]; // 파일 타입은 추후 정의
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequestsResponse extends ApiResponse<TaskRequest[]> {}

export interface ProjectStageTask {
  taskId: number;
  title: string;
  content: string;
  taskOrder: number;
  status: '신청 대기 중' | '승인 대기 중' | '승인' | '반려';
}

export interface ProjectStage {
  id: number;
  name: string;
  stageOrder: number;
  tasks: ProjectStageTask[];
}

export interface ProjectStagesResponse extends ApiResponse<ProjectStage[]> {}

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