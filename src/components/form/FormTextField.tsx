import { IonInput, IonItem } from '@ionic/react'
import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import type { ComponentProps } from 'react'

type AutocompleteType = ComponentProps<typeof IonInput>['autocomplete']

interface FormTextFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  placeholder?: string
  autocomplete?: AutocompleteType
  disabled?: boolean
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autocomplete,
  disabled,
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <IonItem>
          <IonInput
            label={label}
            labelPlacement="stacked"
            type={type}
            placeholder={placeholder}
            autocomplete={autocomplete}
            disabled={disabled}
            value={field.value ?? ''}
            onIonInput={(e) => {
              const raw = e.detail.value ?? ''
              field.onChange(type === 'number' ? (raw === '' ? '' : Number(raw)) : raw)
            }}
            onIonBlur={field.onBlur}
            errorText={fieldState.error?.message}
            className={fieldState.error ? 'ion-invalid ion-touched' : undefined}
          />
        </IonItem>
      )}
    />
  )
}
