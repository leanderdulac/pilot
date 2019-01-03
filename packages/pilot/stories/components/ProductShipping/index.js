import React, { Component } from 'react'
import { Card } from 'former-kit'
import { contains, split, when } from 'ramda'
import { action } from '@storybook/addon-actions'

import Section from '../../Section'
import ShippingFormComponent from '../../../src/containers/CreateTransaction/Products/Shipping'

const splitNameIfHasDot = when(
  contains('.'),
  split('.')
)

const mergeStateObject = (inputName, { value }) => {
  const name = splitNameIfHasDot(inputName)

  if (typeof name === 'string') {
    return (
      ({ data }) => ({
        data: {
          ...data,
          [name]: value,
        },
      })
    )
  }

  const [parent, key] = name

  return ({ data }) => ({
    data: {
      ...data,
      [parent]: {
        ...data[parent],
        [key]: value,
      },
    },
  })
}

const actionChange = action('change')

class ShippingForm extends Component {
  constructor () {
    super()

    this.state = {
      data: {
        address: {
          city: '',
          complementary: '',
          country: 'BR',
          neighborhood: '',
          state: '',
          street: '',
          streetNumber: '',
          zipcode: '',
        },
        deliveryDate: '',
        expedited: 'express',
        fee: '',
        name: '',
      },
    }

    this.onChange = this.onChange.bind(this)
    this.onChangeWithMask = this.onChangeWithMask.bind(this)
  }

  onChange (data) {
    this.setState({
      data,
    }, () => actionChange(this.state))
  }

  onChangeWithMask (name) {
    return ({ target }) => this.setState(
      mergeStateObject(name, target),
      () => actionChange(this.state)
    )
  }

  render () {
    return (
      <Section>
        <Card>
          <ShippingFormComponent
            data={this.state.data}
            onChange={this.onChange}
            onChangeWithMask={this.onChangeWithMask}
            t={t => t}
          />
        </Card>
      </Section>
    )
  }
}

export default ShippingForm
