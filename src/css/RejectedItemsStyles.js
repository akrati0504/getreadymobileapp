import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background to match other screens
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    zIndex: 10,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  headerSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    marginLeft: 10,
    marginRight: 10,
  },
  headerSearchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100, // For tab bar
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: (width - 50) / 3, // 3 cards with gaps
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  emptyStateIconContainer: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  listContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImageGroup: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 15,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeRejected: {
    backgroundColor: '#fef2f2',
  },
  badgePending: {
    backgroundColor: '#fefce8',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textRejected: {
    color: '#ef4444',
  },
  textPending: {
    color: '#eab308',
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 15,
  },
  pill: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  pillRejected: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
    borderStyle: 'dashed',
  },
  pillPending: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  pillInfo: {
    fontSize: 11,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d4af37', // var(--premium-gold)
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnFixNow: {
    backgroundColor: '#1f2937',
  },
  btnPending: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  btnTextPending: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  }
});

export default styles;

