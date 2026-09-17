import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  logoImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1.5,
    borderColor: '#DAA520',
  },
  headerSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 10,
  },
  headerSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
    padding: 0,
    marginLeft: 5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
  pageHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: '#fff7ed', // Pale orange
    padding: 12,
    borderRadius: 12,
    marginRight: 15,
  },
  pageTitleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 40,
  },
  emptyCartIconWrapper: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  startBrowsingBtn: {
    backgroundColor: '#FFA500',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    width: '80%',
    alignItems: 'center',
  },
  startBrowsingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bagItemsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80, // Increased to ensure it scrolls past bottom nav
  },

  // NEW CART ITEM CARD STYLES
  bagItemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: '#e84118'
  },
  badge: {
    backgroundColor: '#f59e0b', // Orange
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 10,
  },
  badgeBuy: {
    backgroundColor: '#16a34a', // Green
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  sizeConditionRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  sizeBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  conditionBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaTextDark: {
    fontSize: 13,
    color: '#374151',
  },
  rentalCostBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  rentalCostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rentalCostLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rentalCostPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  purchaseCostBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  purchaseCostLabel: {
    fontSize: 12,
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  purchaseCostSubLabel: {
    fontSize: 12,
    color: '#16a34a',
  },
  purchaseCostPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  subtotalContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  subtotalLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  subtotalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtotalPriceBuy: {
    color: '#1f2937', // Kept dark as per screenshot
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  removeText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 4,
  },

  // ORDER SUMMARY
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: '#2d3748', // Dark header
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  summaryBody: {
    padding: 20,
  },
  deliverToRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliverToLabel: {
    fontSize: 13,
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  changeText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  deliverToAddressContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deliverToAddressText: {
    marginLeft: 8,
  },
  deliverToValue: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  summaryLabelBlue: {
    color: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryValueBlue: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  summaryValueGreen: {
    color: '#16a34a',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  checkoutBtn: {
    backgroundColor: '#FFA500', // Matched to theme
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    marginTop: 20,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  paymentMethodsTitle: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  paymentMethodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodBtnActive: {
    borderColor: '#FFA500', // Matched to theme
    backgroundColor: '#fffcf9',
  },
  paymentMethodIcon: {
    marginBottom: 5,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  paymentMethodTextActive: {
    color: '#FFA500', // Matched to theme
  },
  continueShoppingBtn: {
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  continueShoppingText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  }
});
