import { apiFetch } from '../../lib/api'
import type { Student, StudentInput } from './types'

export function listStudents(): Promise<Student[]> {
  return apiFetch<Student[]>('/students')
}

export function createStudent(data: StudentInput): Promise<Student> {
  return apiFetch<Student>('/students', { method: 'POST', body: JSON.stringify(data) })
}

export function updateStudent(id: number, data: StudentInput): Promise<Student> {
  return apiFetch<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteStudent(id: number): Promise<void> {
  return apiFetch<void>(`/students/${id}`, { method: 'DELETE' })
}
