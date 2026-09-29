import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  listNewItemBtn: {
    backgroundColor: '#ffb700',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffb700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listNewItemText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: 90,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionsContainer: {
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionStatusPending: { backgroundColor: '#fef3c7' }, actionStatusRejected: { backgroundColor: '#fee2e2' }, actionStatus: {
    backgroundColor: '#dcfce7', // light green
  },
  actionView: {
    backgroundColor: '#f1f5f9', // light gray
  },
  actionEdit: {
    backgroundColor: '#eff6ff', // light blue
  },
  actionDelete: {
    backgroundColor: '#fee2e2', // light red
  },
  pricingContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pricingLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  pricingValue: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  earningsLabel: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  earningsValue: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '800',
  },
});
