import {
  __,
  always,
  applySpec,
  complement,
  cond,
  defaultTo,
  divide,
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
  prop,
  props,
  propEq,
  propIs,
  propOr,
  propSatisfies,
  splitAt,
  T,
  unless,
  values,
} from 'ramda'
import moment from 'moment'

const LIMITER = '-'

// eslint-disable-next-line no-useless-escape
const scapeString = value => `"${value}"`

const isArrayToStringScape = value => ifElse(
  is(Array),
  pipe(
    map(propOr('', value)),
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

const pickCardDigits = pick(['card_first_digits', 'card_last_digits'])

const concatCardDigits = pipe(
  pickCardDigits,
  values,
  join('******')
)

const getCardNumber = ifElse(
  propIs(String, 'card_first_digits'),
  concatCardDigits,
  always(LIMITER)
)

const getCustomerName = pipe(path(['customer', 'name']))

const getCustomerSubProp = subProp => pathOr(LIMITER, ['customer', subProp])

const getAddressProp = either(
  path(['billing', 'address']),
  path(['address'])
)

const getAddressSubProp = property =>
  either(
    pipe(
      getAddressProp,
      prop(property)
    ),
    () => LIMITER
  )

const statusNames = {
  authorized: 'Autorizado',
  default: '-',
  paid: 'Pago',
  pending_refund: 'Estorno pendente',
  processing: 'Processando pagamento',
  refunded: 'Estornado',
  refused: 'Recusada pela operadora de cartão',
  waiting_payment: 'Aguardando pagamento',
}

const getStatus = pipe(
  propOr('default', 'status'),
  prop(__, statusNames)
)

const paymentMethodNames = {
  boleto: 'Boleto',
  credit_card: 'Cartão de Crédito',
  default: '-',
}

const getPaymentMethod = pipe(
  propOr('default', 'payment_method'),
  prop(__, paymentMethodNames)
)

const riskLevels = {
  high: 'Alto',
  low: 'Baixo',
  moderated: 'Moderado',
  very_high: 'Muito alto',
  very_low: 'Muito baixo',
  unknown: '-',
}

const getRiskLevel = pipe(
  propOr('unknown', 'risk_level'),
  prop(__, riskLevels)
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
      join(', ')
    ),
    always('Recebedor Padrão')
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
  String
))

const getSubscriptions = either(
  prop('subscription_id'),
  () => LIMITER
)

const getDocuments = pipe(
  path(['customer', 'documents']),
  ifElse(
    is(Array),
    pipe(
      map(propOr('', 'number')),
      join(', ')
    ),
    always(LIMITER)
  )
)

const getDocumentNumber = ifElse(
  pathSatisfies(isEmptyOrNill, ['customer', 'documents']),
  pathOr(LIMITER, ['customer', 'document_number']),
  getDocuments
)

const formarDate = date => moment(date).format('DD/MM/YYYY HH:mm')

const getUpdatedDate = pipe(
  propOrLimiter('date_created'),
  unless(isNil, formarDate)
)

const getCustomerEmail = pipe(getCustomerSubProp('email'))

const getAcquirerName = pipe(propOrLimiter('acquirer_name'))

const getAcquirerResponseCode = pipe(
  propOrLimiter('acquirer_response_code'),
  ifElse(
    isNil,
    always(LIMITER),
    defaultTo(propOrLimiter('acquirer_response_code'))
  )
)

const getIp = pipe(
  propOrLimiter('ip'),
  ifElse(
    isNil,
    always(LIMITER),
    defaultTo(propOrLimiter('ip'))
  )
)

const getCardBrand = pipe(
  propOrLimiter('card_brand'),
  ifElse(
    isNil,
    always(LIMITER),
    defaultTo(propOrLimiter('amount'))
  )
)

const getBRLProp = property => pipe(
  prop(property),
  ifElse(
    isNil,
    always(LIMITER),
    divide(__, 100)
  )
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
  amount: getBRLProp('amount'),
  paid_amount: getBRLProp('paid_amount'),
  refunded_amount: getBRLProp('refunded_amount'),
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

