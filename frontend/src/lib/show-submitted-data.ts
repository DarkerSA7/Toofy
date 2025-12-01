import { toast } from 'sonner'

/**
 * Display submitted form data as a toast notification
 * Useful for debugging and confirming form submissions
 */
export function showSubmittedData(data: any) {
  const message = JSON.stringify(data, null, 2)
  
  // Log to console for debugging
  console.log('Submitted Data:', data)
  
  // Show toast notification
  toast.success('Data submitted successfully!', {
    description: `Submitted ${Object.keys(data).length} fields`,
  })
}
