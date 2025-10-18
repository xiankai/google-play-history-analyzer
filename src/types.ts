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
  amount: number;
  currency: string;
  date: string;
  documentType: string;
  appName: string;
}
