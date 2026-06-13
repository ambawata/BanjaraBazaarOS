export const mockVendor = {
  id: 'BB-A-0042',
  businessName: 'Riya Crafts & Decor',
  ownerName: 'Riya Sharma',
  email: 'riya@riyacrafts.com',
  phone: '9876543210',
  gstin: '27AABCR5678D1ZX',
  upiId: 'riyacrafts@upi',
  bankName: 'HDFC Bank',
  accountNo: '****4821',
  ifsc: 'HDFC0001234',
  city: 'Jaipur',
  joinedAt: '2024-01-10',
}

export const mockProducts = [
  { id: 'P001', sku: 'RCD-HD-001', name: 'Terracotta Wall Hanging', category: 'Home Decor', basePrice: 850, stock: 12, status: 'approved', submittedAt: '2024-05-01', lastSoldAt: '2026-06-04', daysSinceLastSale: 4 },
  { id: 'P002', sku: 'RCD-FRN-003', name: 'Mango Wood Side Table', category: 'Furniture', basePrice: 3200, stock: 4, status: 'approved', submittedAt: '2024-04-15', lastSoldAt: '2026-05-20', daysSinceLastSale: 18 },
  { id: 'P003', sku: 'RCD-CRK-007', name: 'Ceramic Dinner Set (6)', category: 'Crockery', basePrice: 1450, stock: 8, status: 'pending', submittedAt: '2026-06-05', lastSoldAt: null, daysSinceLastSale: null },
  { id: 'P004', sku: 'RCD-FS-012', name: 'Ganesha Fiber Statue 12"', category: 'Fiber Statue', basePrice: 680, stock: 20, status: 'pending', submittedAt: '2026-06-06', lastSoldAt: null, daysSinceLastSale: null },
  { id: 'P005', sku: 'RCD-FRN-009', name: 'Jute Dhurrie 4x6ft', category: 'Furnishing', basePrice: 1100, stock: 6, status: 'approved', submittedAt: '2024-03-10', lastSoldAt: '2026-04-10', daysSinceLastSale: 58 },
  { id: 'P006', sku: 'RCD-HD-015', name: 'Brass Diya Set (12)', category: 'Home Decor', basePrice: 420, stock: 30, status: 'approved', submittedAt: '2024-02-20', lastSoldAt: '2026-04-18', daysSinceLastSale: 50 },
  { id: 'P007', sku: 'RCD-OUT-004', name: 'Bamboo Garden Planter', category: 'Outdoor', basePrice: 560, stock: 9, status: 'rejected', submittedAt: '2026-05-28', lastSoldAt: null, daysSinceLastSale: null, rejectReason: 'Poor image quality — resubmit with clearer photos' },
  { id: 'P008', sku: 'RCD-PLT-002', name: 'Succulent Combo Pack', category: 'Plants', basePrice: 380, stock: 15, status: 'pending', submittedAt: '2026-06-07', lastSoldAt: null, daysSinceLastSale: null },
]

export const mockSettlements = [
  { id: 'S001', period: 'May 2026', ordersCount: 34, grossAmount: 28600, advanceDeducted: 5200, netAmount: 23400, status: 'upcoming', payoutDate: '2026-06-17' },
  { id: 'S002', period: 'Apr 2026', ordersCount: 28, grossAmount: 22800, advanceDeducted: 3000, netAmount: 19800, status: 'paid', payoutDate: '2026-05-17' },
  { id: 'S003', period: 'Mar 2026', ordersCount: 41, grossAmount: 34100, advanceDeducted: 4500, netAmount: 29600, status: 'paid', payoutDate: '2026-04-17' },
  { id: 'S004', period: 'Feb 2026', ordersCount: 19, grossAmount: 15200, advanceDeducted: 2000, netAmount: 13200, status: 'paid', payoutDate: '2026-03-17' },
]

export const mockDeadStock = mockProducts.filter(p => p.daysSinceLastSale !== null && p.daysSinceLastSale >= 45)

export const dashboardKPIs = {
  activeProducts: mockProducts.filter(p => p.status === 'approved').length,
  pendingApprovals: mockProducts.filter(p => p.status === 'pending').length,
  nextSettlementDate: '17 Jun 2026',
  nextSettlementAmount: 23400,
  earningsThisMonth: 28600,
}
