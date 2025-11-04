/**
 * Export Utilities
 * Provides CSV and Excel export functionality
 */

export interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): string {
  if (data.length === 0) {
    return ''
  }

  const { includeHeaders = true } = options

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Build CSV rows
  const rows: string[] = []

  // Add headers
  if (includeHeaders) {
    rows.push(headers.map(h => escapeCSVValue(h)).join(','))
  }

  // Add data rows
  for (const item of data) {
    const values = headers.map(header => {
      const value = item[header]
      return escapeCSVValue(value)
    })
    rows.push(values.join(','))
  }

  return rows.join('\n')
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Download CSV file
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const { filename = 'export.csv' } = options
  const csv = arrayToCSV(data, options)

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert array of objects to Excel-compatible CSV (UTF-8 BOM)
 */
export function arrayToExcelCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): string {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  return BOM + arrayToCSV(data, options)
}

/**
 * Download Excel CSV file
 */
export function downloadExcelCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const { filename = 'export.csv' } = options
  const csv = arrayToExcelCSV(data, options)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date | null): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(
  amount: number | null | undefined,
  currency: string = 'USD'
): string {
  if (amount === null || amount === undefined) return ''
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Export users to CSV
 */
export function exportUsersToCSV(users: any[]): void {
  const formattedUsers = users.map(user => ({
    'Email': user.email,
    'Name': user.name,
    'Role': user.role,
    'Department': user.department,
    'Branch': user.branch,
    'Position': user.position,
    'Hire Date': formatDateForExport(user.hire_date),
    'Status': user.is_active ? 'Active' : 'Inactive',
  }))

  downloadExcelCSV(formattedUsers, { filename: `users-export-${Date.now()}.csv` })
}

/**
 * Export tasks to CSV
 */
export function exportTasksToCSV(tasks: any[]): void {
  const formattedTasks = tasks.map(task => ({
    'Title': task.title,
    'Description': task.description || '',
    'Status': task.status,
    'Priority': task.priority,
    'Assignee': task.assignee_name || '',
    'Due Date': formatDateForExport(task.due_date),
    'Created': formatDateForExport(task.created_at),
  }))

  downloadExcelCSV(formattedTasks, { filename: `tasks-export-${Date.now()}.csv` })
}

/**
 * Export purchase requests to CSV
 */
export function exportPurchaseRequestsToCSV(requests: any[]): void {
  const formattedRequests = requests.map(req => ({
    'Title': req.title,
    'Description': req.description || '',
    'Category': req.category,
    'Vendor': req.vendor_name || '',
    'Estimated Cost': formatCurrencyForExport(req.estimated_cost, req.currency),
    'Status': req.status,
    'Urgency': req.urgency,
    'Requestor': req.requestor_name || '',
    'Created': formatDateForExport(req.created_at),
  }))

  downloadExcelCSV(formattedRequests, { filename: `purchase-requests-export-${Date.now()}.csv` })
}

