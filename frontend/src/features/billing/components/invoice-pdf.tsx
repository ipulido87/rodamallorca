import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice } from '../services/billing-service'

// Estilos profesionales para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #1976d2',
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'right',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
    color: '#333',
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #e0e0e0',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '40%' },
  col2: { width: '12%', textAlign: 'right' },
  col3: { width: '16%', textAlign: 'right' },
  col4: { width: '16%', textAlign: 'right' },
  col5: { width: '16%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotal: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: 10,
    marginTop: 5,
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderLeft: '4 solid #1976d2',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1 solid #e0e0e0',
    paddingTop: 10,
  },
  statusBadge: {
    padding: '5 10',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  statusDraft: { backgroundColor: '#e0e0e0', color: '#666' },
  statusSent: { backgroundColor: '#bbdefb', color: '#1976d2' },
  statusPaid: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
  statusOverdue: { backgroundColor: '#ffcdd2', color: '#c62828' },
  statusCancelled: { backgroundColor: '#f5f5f5', color: '#999' },
})

interface InvoicePDFProps {
  invoice: Invoice
  workshopName?: string
  workshopAddress?: string
  workshopTaxId?: string
  workshopPhone?: string
  workshopEmail?: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: 'BORRADOR',
    SENT: 'ENVIADA',
    PAID: 'PAGADA',
    OVERDUE: 'VENCIDA',
    CANCELLED: 'CANCELADA',
  }
  return statusMap[status] || status
}

const getStatusStyle = (status: string) => {
  const styleMap: Record<string, any> = {
    DRAFT: styles.statusDraft,
    SENT: styles.statusSent,
    PAID: styles.statusPaid,
    OVERDUE: styles.statusOverdue,
    CANCELLED: styles.statusCancelled,
  }
  return styleMap[status] || styles.statusDraft
}

export const InvoicePDF = ({
  invoice,
  workshopName = 'Tu Taller',
  workshopAddress = '',
  workshopTaxId = '',
  workshopPhone = '',
  workshopEmail = '',
}: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{workshopName}</Text>
        {workshopAddress && <Text style={styles.companyInfo}>{workshopAddress}</Text>}
        {workshopTaxId && <Text style={styles.companyInfo}>NIF/CIF: {workshopTaxId}</Text>}
        {workshopPhone && <Text style={styles.companyInfo}>Tel: {workshopPhone}</Text>}
        {workshopEmail && <Text style={styles.companyInfo}>Email: {workshopEmail}</Text>}
      </View>

      {/* Invoice Title */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.invoiceTitle}>FACTURA</Text>
        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
        <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
          <Text>{getStatusText(invoice.status)}</Text>
        </View>
      </View>

      {/* Dates and Customer Info */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Datos de Facturación</Text>
          <Text style={styles.label}>Fecha de Emisión:</Text>
          <Text style={styles.text}>{formatDate(invoice.issueDate)}</Text>
          {invoice.dueDate && (
            <>
              <Text style={[styles.label, { marginTop: 5 }]}>Fecha de Vencimiento:</Text>
              <Text style={styles.text}>{formatDate(invoice.dueDate)}</Text>
            </>
          )}
          {invoice.paymentMethod && (
            <>
              <Text style={[styles.label, { marginTop: 5 }]}>Método de Pago:</Text>
              <Text style={styles.text}>{invoice.paymentMethod}</Text>
            </>
          )}
        </View>

        {invoice.customer && (
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.text}>{invoice.customer.name}</Text>
            {invoice.customer.taxId && <Text style={styles.text}>NIF/CIF: {invoice.customer.taxId}</Text>}
            {invoice.customer.address && <Text style={styles.text}>{invoice.customer.address}</Text>}
            {invoice.customer.city && (
              <Text style={styles.text}>
                {invoice.customer.postalCode && `${invoice.customer.postalCode} - `}
                {invoice.customer.city}
              </Text>
            )}
            {invoice.customer.email && <Text style={styles.text}>{invoice.customer.email}</Text>}
            {invoice.customer.phone && <Text style={styles.text}>Tel: {invoice.customer.phone}</Text>}
          </View>
        )}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Descripción</Text>
          <Text style={styles.col2}>Cant.</Text>
          <Text style={styles.col3}>Precio Unit.</Text>
          <Text style={styles.col4}>IVA %</Text>
          <Text style={styles.col5}>Total</Text>
        </View>

        {invoice.items?.map((item, index) => (
          <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.col4}>{item.taxRate}%</Text>
            <Text style={styles.col5}>{formatCurrency(item.total || 0)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
        </View>
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>TOTAL:</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notas</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Gracias por su confianza</Text>
        <Text>Factura generada el {new Date().toLocaleDateString('es-ES')}</Text>
      </View>
    </Page>
  </Document>
)
