import {
  __,
  always,
  applySpec,
  complement,
  concat,
  cond,
  either,
  head,
  ifElse,
  is,
  isEmpty,
  isNil,
  join,
  juxt,
  last,
  length,
  map,
  path,
  pathOr,
  pathSatisfies,
  pipe,
  pick,
  prepend,
  prop,
  props,
  propEq,
  propIs,
  propOr,
  propSatisfies,
  splitAt,
  T,
  toString,
  unless,
  values,
} from 'ramda'
import moment from 'moment'

const LIMITER = '"-"'

// eslint-disable-next-line no-useless-escape
const scapeString = value => `\"${value}\"`

const isValueToStringScape = ifElse(
  is(String),
  pipe(
    scapeString
  ),
  always(LIMITER)
)

const isArrayToStringScape = prop => ifElse(
  is(Array),
  pipe(
    map(propOr('', prop)),
    join(', '),
    scapeString
  ),
  always(LIMITER)
)

const isEmptyOrNill = either(isNil, isEmpty)

const propOrLimiter = propOr(LIMITER)

const isAntifraudScoreNil = propSatisfies(isNil, 'antifraud_score')

const isRefuseReasonNil = propSatisfies(isNil, 'refuse_reason')

const getCardProp = subProp => cond([
  [
    pathSatisfies(complement(isNil), ['card', subProp]),
    path(['card', subProp]),
  ],
  [
    propSatisfies(complement(isNil), `card_${subProp}`),
    prop(`card_${subProp}`),
  ],
  [T, always(LIMITER)],
])

const isRefuseReasonAntifraud = propEq('refuse_reason', 'antifraud')

const antifraudRecommendation = cond([
  [isAntifraudScoreNil, always(LIMITER)],
  [isRefuseReasonNil, always(LIMITER)],
  [isRefuseReasonAntifraud, always('refused')],
  [T, always('approved')],
])

const getAntifraudProp = ifElse(
  isAntifraudScoreNil,
  always(LIMITER),
  applySpec({
    recommendation: antifraudRecommendation,
    score: propOrLimiter('antifraud_score'),
  })
)

const hasCardNumber = propEq('payment_method', 'credit_card')

const pickCardDigits = pick(['card_first_digits','card_last_digits'])

const concatCardDigits = pipe(
  pickCardDigits,
  values,
  join('******'),
  isValueToStringScape,
)

const getCardNumber = ifElse(
  propIs(String, 'card_first_digits'),
  concatCardDigits,
  always(LIMITER)
)

const getCustomerName = pipe(
  path(['customer', 'name']),
  isValueToStringScape
)

const getCustomerSubProp = subProp => pathOr(LIMITER, ['customer', subProp])

const getAddressSubProp = subProp => pathOr(LIMITER, [path(['billing', 'address']), subProp])

const getCaptureMethod = ifElse(
  propSatisfies(isNil, 'capture_method'),
  propOrLimiter('capture_method'),
  getCardProp('capture_method')
)

const statusNames = {
  authorized: 'Autorizado',
  default: LIMITER,
  paid: 'Pago',
  pending_refund: 'Estorno pendente',
  processing: 'Processando pagamento',
  refunded: 'Estornado',
  refused: 'Recusada pela operadora de cartão',
  waiting_payment: 'Aguardando pagamento',
}

const getStatus = pipe(
  propOr('default', 'status'),
  prop(__, statusNames),
  isValueToStringScape,
)

const paymentMethodNames = {
  boleto: 'Boleto',
  credit_card: 'Cartão de Crédito',
  default: LIMITER,
}

const getPaymentMethod = pipe(
  propOr('default', 'payment_method'),
  prop(__, paymentMethodNames),
  isValueToStringScape,
)

const riskLevels = {
  high: 'Alto',
  low: 'Baixo',
  moderated: 'Moderado',
  very_high: 'Muito alto',
  very_low: 'Muito baixo',
  unknown: LIMITER,
}

const getRiskLevel = pipe(
  propOr('unknown', 'risk_level'),
  prop(__, riskLevels),
  isValueToStringScape,
)

const formatPhoneNumber = (number) => {
  if (!number) return ''
  const len = length(number) - 4
  return join('-', splitAt(len, number))
}

const formatPhoneProp = pipe(
  props(['ddd', 'number']),
  juxt([
    pipe(
      head,
      h => `(${h})`
    ),
    pipe(
      last,
      formatPhoneNumber
    ),
  ]),
  join(' ')
)

const getRecipients = pipe(
  prop('split_rules'),
  ifElse(
    is(Array),
    pipe(
      map(propOr('', 'id')),
      join(', '),
      scapeString
    ),
    always('"Recebedor Padrão"')
  )
)

const getPhoneProp = pipe(
  propOrLimiter('phone'),
  ifElse(
    isEmptyOrNill,
    always(LIMITER),
    formatPhoneProp
  )
)

const getPhones = pipe(getPhoneProp)

const getId = unless(isNil, pipe(
  propOrLimiter('tid'), 
  String,
  isValueToStringScape,
))

const getDocuments = pipe(
  path(['customer', 'documents']),
  isArrayToStringScape('number'),
)

const getSubscriptions = pipe(
  prop('subscription_id'),
  isArrayToStringScape('id'),
)

const getDocumentNumber = ifElse(
  pathSatisfies(isEmptyOrNill, ['customer', 'documents']),
  pathOr(LIMITER, ['customer', 'document_number']),
  getDocuments,
)

const formarDate = date => moment(date).format('DD/MM/YYYY HH:mm')

const getUpdatedDate = pipe(
  propOrLimiter('date_created'),
  unless(isNil, formarDate),
  isValueToStringScape,
)

const getCustomerEmail = pipe(
  getCustomerSubProp('email'),
  isValueToStringScape,
)

const getAcquirerName = pipe(
  propOrLimiter('acquirer_name'),
  isValueToStringScape,
)

const getAcquirerResponseCode = pipe(
  propOrLimiter('acquirer_response_code'),
  isValueToStringScape,
)

const getIp = pipe(
  pathSatisfies(isEmptyOrNill, ['customer', 'ip']),
  isValueToStringScape,
)

const getAmount = pipe(
  propOrLimiter('amount'),
  isValueToStringScape,
)

const getRefundAmount = pipe(
  propOrLimiter('amount'),
  isValueToStringScape,
)

const getCardBrand = pipe(
  getCardProp('brand'),
  isValueToStringScape,
)

const transactionSpec = {
  status: getStatus,
  id: getId,
  updated_at: getUpdatedDate,
  name: getCustomerName,
  payment_method: getPaymentMethod,
  card_number: getCardNumber,
  documents: getDocumentNumber,
  email: getCustomerEmail,
  subscription: getSubscriptions,
  phones: getPhones,
  acquirer_name: getAcquirerName,
  acquirer_response_code: getAcquirerResponseCode,
  ip: getIp,
  brand_name: getCardBrand,
  amount: getAmount,
  capture_method: getCaptureMethod,
  refund_amount: getRefundAmount,
  split_rules: getRecipients,
  street: getAddressSubProp('street'),
  streetNumber: getAddressSubProp('street_number'),
  complementary: getAddressSubProp('complementary'),
  neighborhood: getAddressSubProp('neighborhood'),
  zipcode: getAddressSubProp('zipcode'),
  city: getAddressSubProp('city'),
  state: getAddressSubProp('state'),
  antifraud: getAntifraudProp,
  risk_level: getRiskLevel,
}

export default transactionSpec

