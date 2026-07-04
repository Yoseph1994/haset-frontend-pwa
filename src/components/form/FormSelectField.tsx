import { IonItem, IonSelect, IonSelectOption } from '@ionic/react'
import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'

interface Option {
  value: string
  label: string
}

interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  options: Option[]
  placeholder?: string
}

export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
}: FormSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <IonItem>
          <IonSelect
            label={label}
            labelPlacement="stacked"
            placeholder={placeholder ?? 'Select one'}
            interface="action-sheet"
            value={field.value ?? null}
            onIonChange={(e) => field.onChange(e.detail.value)}
            className={fieldState.error ? 'ion-invalid ion-touched' : undefined}
          >
            {options.map((option) => (
              <IonSelectOption key={option.value} value={option.value}>
                {option.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      )}
    />
  )
}
