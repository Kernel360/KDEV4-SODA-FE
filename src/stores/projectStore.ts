import { create } from 'zustand'
import type { Project } from '../types/project'
import { fetchProjects } from '../services/projectService'

interface ProjectState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  fetchAllProjects: () => Promise<void>
}

const useProjectStore = create<ProjectState>(set => ({
  projects: [],
  isLoading: false,
  error: null,
  fetchAllProjects: async () => {
    try {
      set({ isLoading: true, error: null })
      const data = await fetchProjects()
      set({ projects: data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  }
}))

export default useProjectStore
