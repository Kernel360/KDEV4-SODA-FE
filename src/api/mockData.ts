import { Company, Member, Project, Stage, Task } from '../types/api';

// 회사 데이터
export const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'company1',
    phoneNumber: '010-2211-2222',
    companyNumber: '02-222-2222',
    ownerName: '윤다빈',
    address: 'address1'
  },
  {
    id: 2,
    name: 'company2',
    phoneNumber: '010-2211-2222',
    companyNumber: '02-222-2222',
    ownerName: '윤다빈',
    address: 'address1'
  }
];

// 멤버 데이터
export const mockMembers: Member[] = [
  {
    id: 1,
    name: '윤다빈',
    authId: 'dabin1234',
    email: 'dabin@example.com',
    role: 'USER',
    company: mockCompanies[1]
  },
  {
    id: 2,
    name: '정서연',
    authId: 'seoyeon1234',
    email: 'seoyeon@example.com',
    role: 'USER',
    company: mockCompanies[0]
  },
  {
    id: 3,
    name: '조준범',
    authId: 'junbeom1234',
    email: 'junbeom@example.com',
    role: 'USER',
    company: mockCompanies[1]
  }
];

// 프로젝트 데이터
export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'SODA',
    description: '소다',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    members: mockMembers,
    companies: mockCompanies
  }
];

// 단계 데이터
export const mockStages: Stage[] = [
  {
    id: 1,
    name: '기획',
    order: 1,
    project: mockProjects[0]
  },
  {
    id: 2,
    name: '개발',
    order: 2,
    project: mockProjects[0]
  },
  {
    id: 3,
    name: '배포',
    order: 3,
    project: mockProjects[0]
  }
];

// 작업 데이터
export const mockTasks: Task[] = [
  {
    id: 1,
    title: '기획하기',
    description: '기획하기~~',
    order: 1,
    stage: mockStages[0]
  },
  {
    id: 2,
    title: '백엔드 프론트 개발',
    description: '프론트 백엔드 개발',
    order: 2,
    stage: mockStages[1]
  },
  {
    id: 3,
    title: 'cicd 구축',
    description: '배포하기 젠킨스 써서',
    order: 3,
    stage: mockStages[2]
  }
]; 