import {
  __,
  always,
  applySpec,
  complement,
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
  prop,
  props,
  propEq,
  propOr,
  propSatisfies,
  splitAt,
  T,
  unless,
} from 'ramda'

const LIMITER = '-'

const paymentMethodNames = {
  boleto: 'Boleto',
  credit_card: 'Cartão de Crédito',
  default: LIMITER,
}

const riskLevels = {
  high: 'Alto',
  low: 'Baixo',
  moderated: 'Moderado',
  very_high: 'Muito alto',
  very_low: 'Muito baixo',
  unknown: LIMITER,
}

const isEmptyOrNill = either(isNil, isEmpty)

const propOrLimiter = propOr(LIMITER)

const isAntifraudScoreNil = propSatisfies(isNil, 'antifraud_score')

const isRefuseReasonNil = propSatisfies(isNil, 'refuse_reason')

/*
  ESTA FUNÇÃO TOSCA PODE SER COLOCADA EM QUALQUER PIPE
  PARA OS CASOS DE STRINGS QUE PRECISAM SER ESCAPADAS
  HÁ UM EXEMPLO DISSO NA LINHA 184 (PS: APAGAR ESTE COMENTÁRIO BOSTA)
*/
// eslint-disable-next-line no-useless-escape
const scapeString = value => `\'${value}\'`

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

const getPaymentMethod = pipe(
  propOr('default', 'payment_method'),
  prop(__, paymentMethodNames)
)

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
    always(null),
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

const getDocumentNumber = ifElse(
  pathSatisfies(isEmptyOrNill, ['customer', 'documents']),
  pathOr(LIMITER, ['customer', 'document_number']),
  getDocuments
)


const transactionSpec = {
  status: getStatus,
  id: getId,
  updated_at: propOrLimiter('date_updated'),
  name: getCustomerSubProp('name'),
  payment_method: getPaymentMethod,
  first_digits: getCardProp('first_digits'),
  documents: getDocumentNumber,
  email: getCustomerSubProp('email'),
  subscription: propOrLimiter('subscription_id'),
  phones: getPhones,
  holder_name: getCardProp('holder_name'),
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

