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
  prepend,
  prop,
  props,
  propEq,
  propOr,
  propSatisfies,
  splitAt,
  T,
  toString,
  unless,
} from 'ramda'
import moment from 'moment'

const LIMITER = '-'

const isEmptyOrNill = either(isNil, isEmpty)

const propOrLimiter = propOr(LIMITER)

const isAntifraudScoreNil = propSatisfies(isNil, 'antifraud_score')

const isRefuseReasonNil = propSatisfies(isNil, 'refuse_reason')

// eslint-disable-next-line no-useless-escape
const scapeString = value => `\"${value}\"`

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

const getCardNumber = pipe(
  path(['card', 'last_digits']),
  ifElse(
    is(String),
    pipe(
      concat('******'),
      //concat(prop('first_digits')),
      scapeString,
      (res) => (console.log(res)),
    ),
    always(LIMITER)
  ),
)

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
const getCustomerName = pipe(
  path(['customer', 'name']),
  ifElse(
    is(String),
    pipe(
      scapeString
    ),
    always(LIMITER)
  )
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
  prop(__, statusNames)
)

const paymentMethodNames = {
  boleto: 'Boleto',
  credit_card: 'Cartão de Crédito',
  default: LIMITER,
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
  unknown: LIMITER,
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
      join(', '),
      scapeString
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

const getId = unless(isNil, pipe(propOrLimiter('tid'), String))

const getDocuments = pipe(
  path(['customer', 'documents']),
  ifElse(
    is(Array),
    pipe(
      map(propOr('', 'number')),
      join(', '),
      scapeString
    ),
    always(LIMITER)
  )
)

const getSubscriptions = pipe(
  prop('subscription_id'),
  ifElse(
    is(Array),
    pipe(
      map(propOr('', 'id')),
      join(', '),
      scapeString
    ),
    always(LIMITER)
  )
)

const getDocumentNumber = ifElse(
  pathSatisfies(isEmptyOrNill, ['customer', 'documents']),
  pathOr(LIMITER, ['customer', 'document_number']),
  getDocuments
)


const formarDate = date => moment(date).format('DD/MM/YYYY hh:mm')

const getUpdatedDate = pipe(
  propOrLimiter('date_created'),
  unless(isNil, formarDate)
)

const transactionSpec = {
  status: getStatus,
  id: getId,
  updated_at: getUpdatedDate,
  name: getCustomerName,
  payment_method: getPaymentMethod,
  card_number: getCardNumber,
  documents: getDocumentNumber,
  email: getCustomerSubProp('email'),
  subscription: getSubscriptions,
  phones: getPhones,
  acquirer_name: propOrLimiter('acquirer_name'),
  acquirer_response_code: propOrLimiter('acquirer_response_code'),
  ip: propOrLimiter('ip'),
  brand_name: getCardProp('brand'),
  amount: propOrLimiter('amount'),
  capture_method: getCaptureMethod,
  refund_amount: propOrLimiter('refunded_amount'),
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

