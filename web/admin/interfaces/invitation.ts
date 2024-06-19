export interface InvitationInfo {
  identifier: string,
  invitationId: number,
  legalName: string,
  legalType: string,
  message: string,
  recipients: string,
  sentDate: string,
  status: string,
  taxId: string | number | null
}
