export const mockVendors = [
  { id: 'V001', name: 'Rajesh Textiles', gstin: '27AABCU9603R1ZX', phone: '9876543210', city: 'Mumbai', status: 'active', joinedAt: '2024-01-15', totalProducts: 42, revenue: 184500 },
  { id: 'V002', name: 'Priya Handicrafts', gstin: '07BBBCS1234D1ZY', phone: '9812345678', city: 'Delhi', status: 'pending', joinedAt: '2024-06-02', totalProducts: 18, revenue: 0 },
  { id: 'V003', name: 'Ahmedabad Spices Co', gstin: '24CCCXZ5678E1ZZ', phone: '9988776655', city: 'Ahmedabad', status: 'pending', joinedAt: '2024-06-05', totalProducts: 0, revenue: 0 },
  { id: 'V004', name: 'Karnataka Silks', gstin: '29DDDKL3456F1ZA', phone: '9123456789', city: 'Bangalore', status: 'active', joinedAt: '2023-11-20', totalProducts: 87, revenue: 342000 },
  { id: 'V005', name: 'Kolkata Arts', gstin: '19EEEBC7890G1ZB', phone: '9765432109', city: 'Kolkata', status: 'rejected', joinedAt: '2024-05-10', totalProducts: 0, revenue: 0 },
]

export const mockApprovals = [
  { id: 'P001', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Banarasi Silk Saree', sku: 'RTX-SAR-001', category: 'Sarees', costPrice: 1200, sellingPrice: 1650, margin: 27.3, images: 3, submittedAt: '2024-06-06', status: 'pending' },
  { id: 'P002', vendorId: 'V004', vendorName: 'Karnataka Silks', name: 'Mysore Silk Dupatta', sku: 'KSL-DUP-014', category: 'Dupattas', costPrice: 450, sellingPrice: 490, margin: 8.2, images: 2, submittedAt: '2024-06-06', status: 'pending' },
  { id: 'P003', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Cotton Kurta Set', sku: 'RTX-KUR-022', category: 'Kurtas', costPrice: 380, sellingPrice: 520, margin: 26.9, images: 4, submittedAt: '2024-06-05', status: 'pending' },
  { id: 'P004', vendorId: 'V004', vendorName: 'Karnataka Silks', name: 'Silk Blouse Piece', sku: 'KSL-BLZ-003', category: 'Blouses', costPrice: 290, sellingPrice: 380, margin: 23.7, images: 2, submittedAt: '2024-06-04', status: 'approved' },
  { id: 'P005', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Chanderi Suit', sku: 'RTX-SUT-008', category: 'Suits', costPrice: 950, sellingPrice: 990, margin: 4.0, images: 3, submittedAt: '2024-06-03', status: 'rejected', rejectReason: 'Margin below 15%' },
]

export const mockProducts = [
  { id: 'P101', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Banarasi Silk Saree', sku: 'RTX-SAR-001', category: 'Sarees', costPrice: 1200, sellingPrice: 1650, margin: 27.3, stock: 12, sold: 34, lastSoldAt: '2024-06-05' },
  { id: 'P102', vendorId: 'V004', vendorName: 'Karnataka Silks', name: 'Silk Blouse Piece', sku: 'KSL-BLZ-003', category: 'Blouses', costPrice: 290, sellingPrice: 380, margin: 23.7, stock: 5, sold: 67, lastSoldAt: '2024-06-06' },
  { id: 'P103', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Cotton Kurta Set', sku: 'RTX-KUR-022', category: 'Kurtas', costPrice: 380, sellingPrice: 520, margin: 26.9, stock: 22, sold: 18, lastSoldAt: '2024-04-12' },
  { id: 'P104', vendorId: 'V004', vendorName: 'Karnataka Silks', name: 'Mysore Silk Dupatta', sku: 'KSL-DUP-014', category: 'Dupattas', costPrice: 450, sellingPrice: 490, margin: 8.2, stock: 8, sold: 4, lastSoldAt: '2024-03-20' },
  { id: 'P105', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Embroidered Lehenga', sku: 'RTX-LEH-005', category: 'Lehengas', costPrice: 2800, sellingPrice: 4200, margin: 33.3, stock: 3, sold: 11, lastSoldAt: '2024-06-01' },
]

const today = new Date('2024-06-07')
function daysSince(dateStr) {
  return Math.floor((today - new Date(dateStr)) / 86400000)
}

export const mockDeadStock = [
  { id: 'DS001', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Chanderi Suit', sku: 'RTX-SUT-008', stock: 14, lastSoldAt: '2024-03-20', daysSinceLastSale: daysSince('2024-03-20'), costValue: 950 * 14, flagged: false },
  { id: 'DS002', vendorId: 'V004', vendorName: 'Karnataka Silks', name: 'Mysore Silk Dupatta', sku: 'KSL-DUP-014', stock: 8, lastSoldAt: '2024-03-20', daysSinceLastSale: daysSince('2024-03-20'), costValue: 450 * 8, flagged: false },
  { id: 'DS003', vendorId: 'V001', vendorName: 'Rajesh Textiles', name: 'Plain Georgette Saree', sku: 'RTX-SAR-012', stock: 6, lastSoldAt: '2024-04-15', daysSinceLastSale: daysSince('2024-04-15'), costValue: 620 * 6, flagged: false },
]

export const mockSettlements = [
  { id: 'S001', vendorId: 'V001', vendorName: 'Rajesh Textiles', period: 'May 2024', ordersCount: 28, grossRevenue: 48400, platformFee: 4840, netPayable: 43560, status: 'pending' },
  { id: 'S002', vendorId: 'V004', vendorName: 'Karnataka Silks', period: 'May 2024', ordersCount: 52, grossRevenue: 87200, platformFee: 8720, netPayable: 78480, status: 'pending' },
  { id: 'S003', vendorId: 'V001', vendorName: 'Rajesh Textiles', period: 'Apr 2024', ordersCount: 31, grossRevenue: 52100, platformFee: 5210, netPayable: 46890, status: 'settled' },
  { id: 'S004', vendorId: 'V004', vendorName: 'Karnataka Silks', period: 'Apr 2024', ordersCount: 44, grossRevenue: 71500, platformFee: 7150, netPayable: 64350, status: 'settled' },
]

export const mockAuditLogs = [
  { id: 'A001', actor: 'admin@bb.com', action: 'PRODUCT_APPROVED', target: 'RTX-SAR-001', detail: 'Product approved for listing', ts: '2024-06-06T14:32:00Z' },
  { id: 'A002', actor: 'admin@bb.com', action: 'PRODUCT_REJECTED', target: 'RTX-SUT-008', detail: 'Margin below 15% threshold', ts: '2024-06-06T14:28:00Z' },
  { id: 'A003', actor: 'admin@bb.com', action: 'VENDOR_APPROVED', target: 'V001', detail: 'Vendor Rajesh Textiles activated', ts: '2024-01-15T09:10:00Z' },
  { id: 'A004', actor: 'admin@bb.com', action: 'SETTLEMENT_PAID', target: 'S003', detail: '₹46,890 settled to Rajesh Textiles', ts: '2024-05-03T11:00:00Z' },
  { id: 'A005', actor: 'admin@bb.com', action: 'DEADSTOCK_FLAGGED', target: 'RTX-SUT-008', detail: '14 units flagged for return', ts: '2024-06-05T16:45:00Z' },
]

export const dashboardStats = {
  totalVendors: 4,
  pendingVendors: 2,
  pendingProducts: 3,
  totalRevenue: 526500,
  platformFee: 52650,
  deadStockValue: mockDeadStock.reduce((a, d) => a + d.costValue, 0),
}
