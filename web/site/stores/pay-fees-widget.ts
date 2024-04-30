import { defineStore } from 'pinia'
import { v4 as UUIDv4 } from 'uuid'
import { StatusCodes } from 'http-status-codes'

import type { FeeInfo, PayFeesWidgetItem } from '~/interfaces/fees'
import { type Error } from '~/interfaces/error'
import { type FilingData } from '~/interfaces/filing-data'

import payApi from '~/services/pay-api'

export const usePayFeesWidget = defineStore('payFeeWidget', () => {
  const errors: Ref<Error[]> = ref([])

  const fees: Ref<PayFeesWidgetItem[]> = ref([])
  const folioNumber = ref('')

  const feeInfo: Ref<[FilingData, FeeInfo][]> = ref([])

  const addFee = (newFee: FeeInfo) => {
    const index = fees.value.findIndex(fee =>
      fee.filingType === newFee.filingType && fee.filingTypeCode === newFee.filingTypeCode
    )
    if (index === -1) {
      if (!newFee || newFee.total == null || newFee.filingFees == null || newFee.filingTypeCode == null) {
        // todo: should we push this as big error ?
        console.error('Trying to add fee INVALID FEE; Fee is missing details. NewFee:', newFee)
        return
      }
      fees.value.push({ ...newFee, quantity: 1, uiUuid: UUIDv4() })
    }
  }

  const addFeeOrIncreaseCount = (feeToAdd: FeeInfo) => {
    const fee = fees.value.find(fee =>
      fee.filingType === feeToAdd.filingType && fee.filingTypeCode === feeToAdd.filingTypeCode
    )

    if (fee) {
      if (fee.quantity === undefined) {
        fee.quantity = 0
      } else {
        fee.quantity += 1
      }
    } else {
      addFee(feeToAdd)
    }
  }

  const removeFee = (feeToRemove: FeeInfo) => {
    const index = fees.value.findIndex(fee =>
      fee.filingType === feeToRemove.filingType && fee.filingTypeCode === feeToRemove.filingTypeCode
    )
    if (index > -1) { // only splice array when item is found
      fees.value.splice(index, 1)
    }
  }

  const removeFeeOrDecreaseCount = (feeToRemove: FeeInfo) => {
    const fee = fees.value.find(fee =>
      fee.filingType === feeToRemove.filingType && fee.filingTypeCode === feeToRemove.filingTypeCode
    )

    if (fee?.quantity && fee.quantity > 1) {
      fee.quantity -= 1
    } else {
      removeFee(feeToRemove)
    }
  }

  const loadFeeTypesAndCharges = async (newFolioNumber: string, filingData: FilingData[]) => {
    folioNumber.value = newFolioNumber

    for (const filingDataItem of filingData) {
      await payApi.getFeeInfo(filingDataItem)
        .then(({ data, error }) => {
          if (error) {
            console.error(error)
            const err = {
              statusCode: error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
              message: error.message,
              category: ErrorCategory.FEE_INFO
            }
            errors.value.push(err)
          }

          if (data) {
            feeInfo.value.push([filingDataItem, data])
          }
        })
    }
  }

  const getFeeInfo =
          async (searchFilingData: FilingData, tryLoadIfNotCached: boolean = true): Promise<FeeInfo | undefined> => {
            const feeInfoItem = feeInfo.value.find(
              ([fillingData, _]) =>
                fillingData.entityType === searchFilingData.entityType &&
                fillingData.filingTypeCode === searchFilingData.filingTypeCode
            )

            if (feeInfoItem) {
              return feeInfoItem[1]
            } else if (!feeInfoItem && tryLoadIfNotCached) {
              await loadFeeTypesAndCharges(folioNumber.value, [searchFilingData])
              return getFeeInfo(searchFilingData, false)
            }
            return undefined
          }

  return {
    errors,
    fees,
    folioNumber,
    feeInfo,
    loadFeeTypesAndCharges,
    addFee,
    addFeeOrIncreaseCount,
    removeFee,
    removeFeeOrDecreaseCount,
    getFeeInfo
  }
})
