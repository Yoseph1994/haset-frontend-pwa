import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/react'
import { documentTextOutline, openOutline, trashOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { useDeleteDocument, useMyDocuments, useUploadDocument } from '@/hooks/useDocuments'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ApiError } from '@/api/client'
import type { DocumentType } from '@/api/types'

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'work_permit', label: 'Work permit' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'reference_letter', label: 'Reference letter' },
  { value: 'company_reg', label: 'Company registration' },
  { value: 'tin_certificate', label: 'TIN certificate' },
  { value: 'other', label: 'Other' },
]

/** Shared document list + upload panel used during onboarding verification and in the Profile tab. */
export function DocumentsPanel() {
  const { data, isLoading } = useMyDocuments()
  const upload = useUploadDocument()
  const remove = useDeleteDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('national_id')

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    upload.mutate({ document_type: documentType, file })
  }

  return (
    <IonList inset>
      <IonListHeader>
        <IonLabel>Documents</IonLabel>
      </IonListHeader>

      <IonItem>
        <IonSelect
          label="Document type"
          labelPlacement="stacked"
          value={documentType}
          onIonChange={(e) => setDocumentType(e.detail.value)}
        >
          {DOCUMENT_TYPES.map((type) => (
            <IonSelectOption key={type.value} value={type.value}>
              {type.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      <IonItem lines="none">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          hidden
          onChange={handleFileSelected}
        />
        <IonButton fill="outline" disabled={upload.isPending} onClick={() => fileInputRef.current?.click()}>
          {upload.isPending ? <IonSpinner name="dots" /> : 'Upload document'}
        </IonButton>
      </IonItem>

      {upload.isError && (
        <IonText color="danger">
          <p className="ion-padding-horizontal">
            {upload.error instanceof ApiError || upload.error instanceof Error
              ? upload.error.message
              : 'Upload failed.'}
          </p>
        </IonText>
      )}

      {isLoading && <IonSpinner name="dots" className="ion-margin" />}

      {!isLoading && data && data.data.length === 0 && <EmptyState message="No documents uploaded yet" />}

      {data?.data.map((doc) => (
        <IonItem key={doc.id}>
          <IonIcon icon={documentTextOutline} slot="start" />
          <IonLabel>
            <h3>{doc.file_name}</h3>
            <p>{DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label ?? doc.document_type}</p>
            {doc.rejection_reason && <p style={{ color: 'var(--ion-color-danger)' }}>{doc.rejection_reason}</p>}
          </IonLabel>
          <StatusBadge status={doc.status} />
          {doc.file_url && (
            <IonButton fill="clear" href={doc.file_url} target="_blank" rel="noopener">
              <IonIcon icon={openOutline} slot="icon-only" />
            </IonButton>
          )}
          <IonButton fill="clear" color="danger" onClick={() => remove.mutate(doc.id)}>
            <IonIcon icon={trashOutline} slot="icon-only" />
          </IonButton>
        </IonItem>
      ))}
    </IonList>
  )
}
