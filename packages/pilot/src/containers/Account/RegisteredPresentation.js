import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import styles from './style.css'

const RegisteredPresentationContainer = ({
  onGotoSignup,
  t,
}) => (
  <div className={styles.secondaryContent}>
    <div>
      <h1 className={styles.title}>
        {t('landing.title')}
      </h1>
      <span className={styles.uppercase}>
        {t('landing.subtitle')}
      </span>
    </div>
    <p className={styles.paragraph}>
      {t('landing.body')}
    </p>
    <div className={classNames(styles.uppercase, styles.signInBlock)}>
      <p>
        <span>{t('landing.login_call')}</span>
        <span>
          {t('landing.signup_call')}
          <button
            role="link"
            onClick={onGotoSignup}
            className={styles.signInLink}
          >
            {t('landing.signup_action')}
          </button>
        </span>
      </p>
    </div>
  </div>
)

RegisteredPresentationContainer.propTypes = {
  onGotoSignup: PropTypes.func.isRequired,
  t: PropTypes.func,
}

RegisteredPresentationContainer.defaultProps = {
  t: t => t,
}

export default RegisteredPresentationContainer
