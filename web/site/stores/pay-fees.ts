import { v4 as UUIDv4 } from 'uuid'
import { useI18n } from 'vue-i18n'
import payApi from '~/services/pay-api'
import { ConnectPaymentMethod } from '~/enums/connect-payment-method'
import type { ConnectPayAccount } from '~/interfaces/connect-pay-account'

export const usePayFeesStore = defineStore('bar-sbc-pay-fees', () => {
  const fees: Ref<PayFeesWidgetItem[]> = ref([])
  const folioNumber = ref('')
  const feeInfo: Ref<[FeeData, FeeInfo][]> = ref([])
  const PAD_PENDING_STATES = ['PENDING', 'PENDING_PAD_ACTIVATION']
  const userPaymentAccount = ref<ConnectPayAccount>({} as ConnectPayAccount)
  const userSelectedPaymentMethod = ref<ConnectPaymentMethod>(ConnectPaymentMethod.DIRECT_PAY)
  const allowAlternatePaymentMethod = ref<boolean>(false)
  const allowedPaymentMethods = ref<{ label: string, value: ConnectPaymentMethod }[]>([])

  function addFee (newFee: FeeInfo) {
    const fee = fees.value.find((fee: PayFeesWidgetItem) => // check if fee already exists
      fee.filingType === newFee.filingType && fee.filingTypeCode === newFee.filingTypeCode
    )

    if (fee) {
      if (fee.quantity === undefined) {
        fee.quantity = 1 // set quantity to 1 if fee exists but has no quantity
      } else {
        fee.quantity += 1 // increase quantity if it already exists
      }
    } else { // validate fee doesnt have null values
      if (!newFee || newFee.total == null || newFee.filingFees == null || newFee.filingTypeCode == null) {
        return
      }
      fees.value.push({ ...newFee, quantity: 1, uiUuid: UUIDv4() }) // add fee if valid
    }
  }

  function removeFee (feeToRemove: FeeInfo) {
    const fee = fees.value.find((fee: PayFeesWidgetItem) => // check if fee exists
      fee.filingType === feeToRemove.filingType && fee.filingTypeCode === feeToRemove.filingTypeCode
    )

    if (fee?.quantity && fee.quantity > 1) { // decrease quantity if fee exists and greater than 1
      fee.quantity -= 1
    } else { // remove fee if fee quantity <= 1
      const index = fees.value.findIndex((fee: PayFeesWidgetItem) =>
        fee.filingType === feeToRemove.filingType && fee.filingTypeCode === feeToRemove.filingTypeCode
      )
      if (index > -1) {
        fees.value.splice(index, 1)
      }
    }
  }

  async function loadFeeTypesAndCharges (newFolioNumber: string, filingData: FeeData[]) {
    folioNumber.value = newFolioNumber

    // fetch fee info for each fee and add to feeInfo array
    for (const filingDataItem of filingData) {
      const fee = await payApi.fetchFee(filingDataItem)
      if (fee) {
        feeInfo.value.push([filingDataItem, fee])
      }
    }
  }

  async function getFeeInfo (searchFilingData: FeeData, tryLoadIfNotCached: boolean = true): Promise<FeeInfo | undefined> {
    const feeInfoItem = feeInfo.value.find( // check if fee info already exists
      ([filingData, _]) =>
        filingData.entityType === searchFilingData.entityType &&
        filingData.filingTypeCode === searchFilingData.filingTypeCode
    )

    if (feeInfoItem) { // if fee already exists, return fee
      return feeInfoItem[1]
    } else if (!feeInfoItem && tryLoadIfNotCached) { // if no existing fee, load fees then return feeInfoItem
      await loadFeeTypesAndCharges(folioNumber.value, [searchFilingData])
      return getFeeInfo(searchFilingData, false)
    }
    return undefined // return undefined if no fee found and tryLoadIfNotCached = false
  }

  // load fee info and add to fees array
  async function addPayFees (feeCode: string): Promise<void> {
    try {
      const fee = payApi.feeType[feeCode]
      const feeInfo = await getFeeInfo(fee)

      if (feeInfo) {
        addFee(feeInfo)
      }
    } catch {
      const alertStore = useAlertStore()
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.FEE_INFO
      })
    }
  }

  const $resetAlternatePayOptions = () => {
    userPaymentAccount.value = {} as ConnectPayAccount
    userSelectedPaymentMethod.value = ConnectPaymentMethod.DIRECT_PAY
    allowAlternatePaymentMethod.value = false
    allowedPaymentMethods.value = []
  }

  function $reset () {
    fees.value = []
    folioNumber.value = ''
    feeInfo.value = []
    $resetAlternatePayOptions()
  }

  const initAlternatePaymentMethod = async () => {
    $resetAlternatePayOptions()
    const { t } = useI18n()
    try {
      const accountId = useAccountStore().currentAccount.id.toString()
      const res = await payApi.getAccount(accountId)
      userPaymentAccount.value = res

      if (res.paymentMethod) {
        const accountNum = res.cfsAccount?.bankAccountNumber ?? ''
        allowedPaymentMethods.value.push({
          label: t(`paymentMethod.${res.paymentMethod}`, { account: accountNum }),
          value: res.paymentMethod
        })

        if (res.paymentMethod !== ConnectPaymentMethod.DIRECT_PAY) {
          allowedPaymentMethods.value.push({
            label: t(`paymentMethod.${ConnectPaymentMethod.DIRECT_PAY}`),
            value: ConnectPaymentMethod.DIRECT_PAY
          })

          if (PAD_PENDING_STATES.includes(res.cfsAccount?.status)) {
            userSelectedPaymentMethod.value = ConnectPaymentMethod.DIRECT_PAY
          }
        }
      }
      allowAlternatePaymentMethod.value = true
    } catch (e) {
      console.error('Error initializing user payment account', e)
    }
  }

  return {
    fees,
    folioNumber,
    feeInfo,
    loadFeeTypesAndCharges,
    addFee,
    removeFee,
    getFeeInfo,
    addPayFees,
    $reset,
    userPaymentAccount,
    userSelectedPaymentMethod,
    allowedPaymentMethods,
    allowAlternatePaymentMethod,
    initAlternatePaymentMethod
  }
})
