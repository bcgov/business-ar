export const addBarPayFees = async () => {
  const payFeesWidget = usePayFeesWidget()

  const feeInfo = await payFeesWidget.getFeeInfo(
    {
      entityType: 'BC',
      filingTypeCode: 'BCANN',
      futureEffective: false,
      priority: false,
      waiveFees: false
    }
  )

  return payFeesWidget.addFee(feeInfo!)
}
