import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/store"
import { invoke } from "@tauri-apps/api/core"

interface ExportButtonProps {
  data: any[]
  filename: string
  format?: 'csv' | 'json'
}

export function ExportButton({ data, filename, format }: ExportButtonProps) {
  const defaultFormat = useSettingsStore(state => state.settings.defaultExportFormat)
  const exportFormat = format || defaultFormat

  const handleExport = async () => {
    try {
      let content: string
      let exportFilename: string

      if (exportFormat === 'csv') {
        // Convert data to CSV
        if (data.length === 0) {
          content = ''
        } else {
          const headers = Object.keys(data[0])
          const csvHeaders = headers.join(',')
          const csvRows = data.map(row => 
            headers.map(header => {
              const value = row[header]
              // Handle values that might contain commas
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`
              }
              return value ?? ''
            }).join(',')
          )
          content = [csvHeaders, ...csvRows].join('\n')
        }
        exportFilename = `${filename}.csv`
      } else {
        // Export as JSON
        content = JSON.stringify(data, null, 2)
        exportFilename = `${filename}.json`
      }

      await invoke('export_data', {
        format: exportFormat,
        content,
        defaultFilename: exportFilename
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExport}
    >
      Export {exportFormat.toUpperCase()}
    </Button>
  )
}