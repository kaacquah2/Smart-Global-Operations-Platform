/**
 * React Hook for Form Validation
 * Provides easy form validation using the validation utilities
 */

import { useState, useCallback } from 'react'
import { validateForm, ValidationRule, ValidationResult } from '@/lib/validation'

export interface UseFormValidationOptions {
  onSubmit?: (data: Record<string, any>) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  schema: Record<keyof T, ValidationRule>,
  options: UseFormValidationOptions = {}
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = useCallback((): ValidationResult => {
    const result = validateForm(data, schema as Record<string, ValidationRule>)
    setErrors(result.errors)
    return result
  }, [data, schema])

  const validateField = useCallback(
    (field: keyof T) => {
      const fieldSchema = schema[field]
      if (!fieldSchema) return

      // Import validateField from validation.ts
      const { validateField: validateSingleField } = require('@/lib/validation')
      const error = validateSingleField(data[field], fieldSchema, String(field))

      if (error) {
        setErrors((prev) => ({ ...prev, [String(field)]: error }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[String(field)]
          return newErrors
        })
      }
    },
    [data, schema]
  )

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setData((prev) => ({ ...prev, [field]: value }))
      
      // Clear error when user starts typing
      if (errors[String(field)]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[String(field)]
          return newErrors
        })
      }

      // Validate on change if enabled
      if (options.validateOnChange && touched[String(field)]) {
        validateField(field)
      }
    },
    [errors, touched, options.validateOnChange, validateField]
  )

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [String(field)]: true }))
      
      // Validate on blur if enabled
      if (options.validateOnBlur) {
        validateField(field)
      }
    },
    [options.validateOnBlur, validateField]
  )

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {}
      Object.keys(data).forEach((key) => {
        allTouched[key] = true
      })
      setTouched(allTouched)

      // Validate form
      const result = validate()
      if (!result.isValid) {
        return false
      }

      // Submit if handler provided
      if (options.onSubmit) {
        setIsSubmitting(true)
        try {
          await options.onSubmit(data)
        } catch (error) {
          console.error('Form submission error:', error)
          throw error
        } finally {
          setIsSubmitting(false)
        }
      }

      return true
    },
    [data, validate, options.onSubmit]
  )

  const reset = useCallback(() => {
    setData(initialData)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialData])

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
    validateField(field)
  }, [validateField])

  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [String(field)]: error }
      } else {
        const newErrors = { ...prev }
        delete newErrors[String(field)]
        return newErrors
      }
    })
  }, [])

  return {
    data,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    validateField,
    setFieldValue,
    setFieldError,
    reset,
    setData,
  }
}

