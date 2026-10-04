import { test, expect } from '@playwright/test'

test('professora cadastra, cria aluno, cobra e marca pago', async ({ page }) => {
  const email = `carol${Date.now()}@example.com`

  // Cadastro da professora.
  await page.goto('/registrar')
  await page.getByLabel('Nome', { exact: true }).fill('Carol')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('secret123')
  await page.getByLabel('Confirmar senha', { exact: true }).fill('secret123')
  await page.getByLabel('Hora-aula', { exact: true }).fill('20')
  await page.getByRole('button', { name: 'Cadastrar', exact: true }).click()

  // Cadastro da aluna (o formulário de "Novo aluno" já fica visível, sem botão).
  await page.getByRole('link', { name: 'Alunos', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Novo aluno' })).toBeVisible()
  await page.getByLabel('Nome', { exact: true }).fill('Ana')
  await page.getByLabel('Telefone', { exact: true }).fill('31999998888')
  await page.getByLabel('Segunda', { exact: true }).check()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Ana', { exact: true })).toBeVisible()

  // Visão do mês lista a aluna; abrir o detalhe da mensalidade.
  await page.getByRole('link', { name: 'Mês', exact: true }).click()
  const studentLink = page.getByRole('link', { name: 'Ana', exact: true })
  await expect(studentLink).toBeVisible()
  await studentLink.click()

  // Ajuste de aula extra e marcação como paga.
  await page.getByRole('button', { name: 'Aula extra', exact: true }).click()
  await page.getByRole('button', { name: 'Marcar como pago', exact: true }).click()
  await expect(page.getByText('Pago', { exact: true })).toBeVisible()
})
