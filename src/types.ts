export interface PurchaseData {
  purchaseHistory: {
    invoicePrice?: string;
    paymentMethodTitle?: string;
    userLanguageCode?: string;
    userCountry?: string;
    doc: {
      documentType: string;
      title: string;
    };
    purchaseTime: string;
  };
}

export interface ParsedPurchase {
  title: string;
  amount: string;
  currency: string;
  date: string;
  documentType: string;
  appName: string;
}
