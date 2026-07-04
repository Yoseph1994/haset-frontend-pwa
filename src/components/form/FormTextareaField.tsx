import { IonItem, IonTextarea } from '@ionic/react'
import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'

interface FormTextareaFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  rows?: number
}

export function FormTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 4,
}: FormTextareaFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <IonItem>
          <IonTextarea
            label={label}
            labelPlacement="stacked"
            placeholder={placeholder}
            rows={rows}
            value={field.value ?? ''}
            onIonInput={(e) => field.onChange(e.detail.value ?? '')}
            onIonBlur={field.onBlur}
            errorText={fieldState.error?.message}
            className={fieldState.error ? 'ion-invalid ion-touched' : undefined}
          />
        </IonItem>
      )}
    />
  )
}
