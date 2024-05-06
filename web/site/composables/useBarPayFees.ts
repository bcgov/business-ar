export const addBarPayFees = async () => {
  const payFeesWidget = usePayFeesWidget()

  const feeInfo = await payFeesWidget.getFeeInfo(
    {
      entityType: 'BC',
      filingTypeCode: 'ANNBC',
      futureEffective: false,
      priority: false,
      waiveFees: false
    }
  )

  return payFeesWidget.addFee(feeInfo!)
}
