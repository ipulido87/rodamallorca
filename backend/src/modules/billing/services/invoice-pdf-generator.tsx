import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

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
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
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
})

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  customerName: string
  customerEmail: string
  workshopName: string
  workshopAddress?: string
  workshopCity?: string
  workshopTaxId?: string
  workshopPhone?: string
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
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

const InvoicePDFDocument = ({ invoice }: { invoice: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{invoice.workshopName}</Text>
        {invoice.workshopAddress && (
          <Text style={styles.companyInfo}>
            {invoice.workshopAddress}
            {invoice.workshopCity && `, ${invoice.workshopCity}`}
          </Text>
        )}
        {invoice.workshopTaxId && <Text style={styles.companyInfo}>NIF/CIF: {invoice.workshopTaxId}</Text>}
        {invoice.workshopPhone && <Text style={styles.companyInfo}>Tel: {invoice.workshopPhone}</Text>}
      </View>

      {/* Invoice Title */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.invoiceTitle}>FACTURA</Text>
        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
      </View>

      {/* Dates and Customer Info */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Datos de Facturación</Text>
          <Text style={styles.label}>Fecha de Emisión:</Text>
          <Text style={styles.text}>{formatDate(invoice.issueDate)}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.text}>{invoice.customerName}</Text>
          <Text style={styles.text}>{invoice.customerEmail}</Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Descripción</Text>
          <Text style={styles.col2}>Cant.</Text>
          <Text style={styles.col3}>Precio Unit.</Text>
          <Text style={styles.col4}>Total</Text>
        </View>

        {invoice.items.map((item, index) => (
          <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.col4}>{formatCurrency(item.total)}</Text>
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
          <Text style={styles.totalLabel}>IVA (21%):</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
        </View>
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>TOTAL:</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Gracias por su confianza</Text>
        <Text>RodaMallorca - Tu Marketplace de Talleres de Bicicletas</Text>
        <Text>Factura generada el {new Date().toLocaleDateString('es-ES')}</Text>
      </View>
    </Page>
  </Document>
)

/**
 * Genera un PDF de factura y lo devuelve como Buffer
 */
export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<Buffer> => {
  try {
    const blob = await pdf(<InvoicePDFDocument invoice={invoiceData} />).toBuffer()
    return blob
  } catch (error) {
    console.error('❌ [PDF] Error generando PDF de factura:', error)
    throw new Error('Error al generar PDF de factura')
  }
}
