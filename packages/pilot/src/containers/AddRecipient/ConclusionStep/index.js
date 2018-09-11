import React from 'react'
import PropTypes from 'prop-types'

import {
  Button,
  CardContent,
  Spacing,
} from 'former-kit'

import SuccessIcon from './SuccessIcon.svg'
import style from '../style.css'

const ConclusionStep = ({
  onExit,
  onViewDetails,
  t,
}) => (
  <CardContent className={style.flex}>
    <SuccessIcon />
    <p className={style.centerText}>
      {t('pages.recipients.message_success')}
      <br />
      {t('pages.recipients.next_step')}
    </p>
    <div>
      <Button
        fill="outline"
        onClick={onExit}
      >
        {t('pages.recipients.exit')}
      </Button>
      <Spacing size="large" />
      <Button
        fill="gradient"
        onClick={onViewDetails}
      >
        {t('pages.recipients.view_details')}
      </Button>
    </div>
  </CardContent>
)

ConclusionStep.propTypes = {
  onExit: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default ConclusionStep