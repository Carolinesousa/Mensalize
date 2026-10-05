import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStudent, deleteStudent, listStudents, updateStudent } from './api'
import { listPromotions } from '../promotions/api'
import { StudentForm } from './StudentForm'
import type { Student, StudentInput } from './types'

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function toInput(s: Student): StudentInput {
  return { name: s.name, phone: s.phone, due_day: s.due_day, weekdays: s.weekdays, promotion_id: s.promotion?.id ?? null }
}

export function StudentsPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Student | null>(null)
  const [formNonce, setFormNonce] = useState(0)

  const students = useQuery({ queryKey: ['students'], queryFn: listStudents })
  const promotions = useQuery({ queryKey: ['promotions'], queryFn: listPromotions })

  const save = useMutation({
    mutationFn: (data: StudentInput) =>
      editing ? updateStudent(editing.id, data) : createStudent(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['students'] })
      setEditing(null)
      setFormNonce((n) => n + 1)
    },
  })

  const remove = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Alunos</h1>

      <section className="mb-8 rounded border p-4">
        <h2 className="mb-3 text-lg font-semibold">{editing ? `Editar ${editing.name}` : 'Novo aluno'}</h2>
        <StudentForm
          key={editing?.id ?? `new-${formNonce}`}
          initial={editing ? toInput(editing) : undefined}
          promotions={promotions.data ?? []}
          onSubmit={(data) => save.mutate(data)}
        />
        {editing && (
          <button className="mt-2 text-sm text-gray-600 underline" onClick={() => setEditing(null)}>
            Cancelar edição
          </button>
        )}
      </section>

      {students.isLoading && <p>Carregando…</p>}
      {students.isError && <p className="text-red-600">Não foi possível carregar os alunos.</p>}
      <ul className="space-y-2">
        {(students.data ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-gray-600">
                {s.phone} · vence dia {s.due_day} · {s.weekdays.map((w) => WEEKDAY_LABELS[w - 1]).join(', ')}
                {s.promotion && ` · ${s.promotion.name} (${s.promotion.discount_percent}%)`}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="text-indigo-600" onClick={() => setEditing(s)}>Editar</button>
              <button className="text-red-600" onClick={() => remove.mutate(s.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
