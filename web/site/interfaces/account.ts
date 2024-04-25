import { AccountType } from '~/enums/account-type'
import { AccountStatus } from '~/enums/account-status'
import { UserSettingsType } from '~/enums/user-settings-type'

export interface Account {
  id: string
  accountType: AccountType
  accountStatus: AccountStatus
  additionalLabel?: string
  label: string
  type: UserSettingsType.ACCOUNT
  urlpath: string
  urlorigin: string
}
