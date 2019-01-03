import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'

import BoletoRefundDetails from './BoletoRefundDetails'
import CustomerForm from './CustomerForm'
import ConfigurationCardForm from './ConfigurationCardForm'
import CopyButton from './CopyButton'
import CurrencyInput from './CurrencyInput'
import CreditCardRefundDetails from './CreditCardRefundDetails'
import CreditCardForm from './CreditCardForm'
import CustomerSelection from './CustomerSelection'
import CustomerCard from './CustomerCard'
import DataDisplay from './DataDisplay'
import DetailsHead from './DetailsHead'
import EventList from './EventList'
import PaymentCards from './PaymentCards'
import Property from './Property'
import Operations from './Operations'
import RecipientSectionState from './RecipientSection'
import RiskLevel from './RiskLevel'
import ReprocessDetails from './ReprocessDetails'
import Summary from './Summary'
import ProductForm from './ProductForm'
import { WithProducts, EmptyList } from './ProductsList'
import ProductShipping from './ProductShipping'
import TotalDisplay from './TotalDisplay'
import TransferError from './TransferError'
import TransactionDetailsCard from './TransactionDetailsCard'
import TreeView from './TreeView'
import ApiKeySection from './ApiKey'
import PendingRequests from './PendingRequests'
import BalanceTotalDisplay from './BalanceTotalDisplay'
import BalanceSummary from './BalanceSummary'
import SidebarSections from './SidebarSections'
import SidebarSummary from './SidebarSummary'
import Loader from './Loader'
import Message from './Message'
import MessageActions from './MessageActions'
import Quantity from './QuantityInput'

storiesOf('Components|Add Transaction/Customers', module)
  .addDecorator(checkA11y)
  .add('Customer form', () => <CustomerForm />)
  .add('Customer selection', () => <CustomerSelection />)

storiesOf('Components|Add Transaction/Products', module)
  .addDecorator(checkA11y)
  .add('Add products', () => <ProductForm />)
  .add('List products', () => <WithProducts />)
  .add('Empty list products', () => <EmptyList />)
  .add('Shipping form', () => <ProductShipping />)

storiesOf('Components|Add Transaction/Payment', module)
  .addDecorator(checkA11y)
  .add('Credit card form', () => <CreditCardForm />)

storiesOf('Components|Custom components', module)
  .addDecorator(checkA11y)
  .add('Configuration card form', () => <ConfigurationCardForm />)
  .add('Copy button', () => <CopyButton />)
  .add('Currency Input', () => <CurrencyInput />)
  .add('Customer card', () => <CustomerCard />)
  .add('Details head', () => <DetailsHead />)
  .add('Recipient section', () => <RecipientSectionState />)
  .add('Transaction details card', () => <TransactionDetailsCard />)
  .add('Event list', () => <EventList />)
  .add('DataDisplay', () => <DataDisplay />)
  .add('Reprocess details', () => <ReprocessDetails />)
  .add('Payment card', () => <PaymentCards />)
  .add('RiskLevel', () => <RiskLevel />)
  .add('TreeView', () => <TreeView />)
  .add('Property', () => <Property />)
  .add('Boleto Refund Details', () => <BoletoRefundDetails />)
  .add('CreditCardRefundDetails', () => <CreditCardRefundDetails />)
  .add('ApiKey', () => <ApiKeySection />)
  .add('Pending Requests', () => <PendingRequests />)
  .add('Operations', () => <Operations />)
  .add('Balance total display', () => <BalanceTotalDisplay />)
  .add('Balance summary', () => <BalanceSummary />)
  .add('Sidebar Sections', () => <SidebarSections />)
  .add('Sidebar Summary', () => <SidebarSummary />)
  .add('Summary', () => <Summary />)
  .add('Transfer Error', () => <TransferError />)
  .add('Loader', () => <Loader />)
  .add('Message', () => <Message />)
  .add('Message with actions', () => <MessageActions />)
  .add('TotalDisplay', () => <TotalDisplay />)
  .add('Quantity', () => <Quantity />)
