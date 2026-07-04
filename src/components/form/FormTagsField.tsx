import { IonChip, IonIcon, IonInput, IonItem, IonLabel, IonNote } from '@ionic/react'
import { closeCircle } from 'ionicons/icons'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'

interface FormTagsFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
}

/** Enter-to-add tag input for string[] fields (skills, languages, required_skills). */
export function FormTagsField<T extends FieldValues>({ control, name, label, placeholder }: FormTagsFieldProps<T>) {
  const [draft, setDraft] = useState('')

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const tags: string[] = field.value ?? []

        const addTag = () => {
          const value = draft.trim()
          if (value && !tags.includes(value)) {
            field.onChange([...tags, value])
          }
          setDraft('')
        }

        const removeTag = (tag: string) => {
          field.onChange(tags.filter((t) => t !== tag))
        }

        return (
          <IonItem>
            <IonLabel position="stacked">{label}</IonLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
              {tags.map((tag) => (
                <IonChip key={tag} onClick={() => removeTag(tag)}>
                  <IonLabel>{tag}</IonLabel>
                  <IonIcon icon={closeCircle} />
                </IonChip>
              ))}
            </div>
            <IonInput
              placeholder={placeholder ?? 'Type and press enter'}
              value={draft}
              onIonInput={(e) => setDraft(e.detail.value ?? '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              onIonBlur={() => {
                addTag()
                field.onBlur()
              }}
            />
            {fieldState.error && (
              <IonNote slot="helper" color="danger">
                {fieldState.error.message}
              </IonNote>
            )}
          </IonItem>
        )
      }}
    />
  )
}
