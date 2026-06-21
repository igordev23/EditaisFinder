import { test, expect } from '@playwright/test'

test.describe('EditaisFinder - E2E Tests', () => {

  test('Home carrega e exibe oportunidades', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Oportunidades', exact: true })).toBeVisible({ timeout: 10000 })

    const cards = page.locator('.grid > div')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('Filtro por tipo funciona', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.selectOption('select', 'estagio')
    await page.waitForTimeout(1000)

    const tipos = page.locator('.grid > div span:last-child')
    const count = await tipos.count()

    for (let i = 0; i < count; i++) {
      await expect(tipos.nth(i)).toContainText('estagio')
    }
  })

  test('Campo de busca aparece', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder="Buscar por palavra-chave..."]')
    await expect(searchInput).toBeVisible()
  })

  test('Navegação para página de login', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('Header contém links de navegação', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('link', { name: 'EditaisFinder' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Início' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Perfil' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
  })
})
