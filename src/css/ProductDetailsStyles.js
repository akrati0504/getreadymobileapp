import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa', // Light bluish grey background shown in screenshots
  },
  // Header Search Styles
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
    marginLeft: 12,
  },
  
  // Image Gallery
  imageContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  mainImageWrapper: {
    width: width * 0.9,
    height: width * 1.1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e6e0d3', // the brown background in screenshot
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  qcBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  qcBadgeText: {
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#282c3f',
    marginLeft: 5,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 15,
    overflow: 'hidden',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperActive: {
    borderColor: '#FFA500',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  // Card Sections Common
  cardSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  
  // Info Section
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#4169e1', // royal blue
    marginLeft: 4,
  },
  tagPillGold: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffd700',
    borderWidth: 1,
  },
  tagTextGold: {
    color: '#c71585', // pinkish red
  },
  tagPillOrange: {
    backgroundColor: '#fffaf0',
    borderColor: '#ffe4b5',
    borderWidth: 1,
  },
  tagTextOrange: {
    color: '#ff4500', // orange red
  },
  
  titleText: {
    fontSize: 22,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#002b5e', // dark blue
    marginBottom: 5,
  },
  brandText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#555',
    marginBottom: 2,
  },
  productCodeText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  attributeColumn: {
    flexDirection: 'column',
  },
  attributeLabel: {
    fontSize: 11,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 5,
  },
  attributeValue: {
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    fontWeight: '600',
    color: '#002b5e',
  },
  attributeValueGreen: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attributeValueGreenText: {
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    fontWeight: '600',
    color: '#2e8b57', // sea green
    marginLeft: 4,
  },
  
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementsText: {
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    fontWeight: '600',
    color: '#282c3f',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#333',
    lineHeight: 22,
  },
  
  // Details & Care
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#002b5e',
    marginBottom: 15,
  },
  careListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  careListText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#555',
    marginLeft: 10,
  },
  
  // Pricing Section
  priceRowMain: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  priceMainText: {
    fontSize: 28,
    fontFamily: 'OpenSans-Regular',
    fontWeight: '900',
    color: '#282c3f',
  },
  priceDaysText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#888',
    marginBottom: 4,
    marginLeft: 2,
  },
  trustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginBottom: 6,
  },
  trustedBadgeText: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#00a86b',
    marginLeft: 4,
  },
  additionalDayText: {
    fontSize: 13,
    fontFamily: 'OpenSans-Regular',
    color: '#888',
    marginBottom: 20,
  },
  priceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceDetailText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#555',
  },
  priceDetailValueLineThrough: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  priceDetailValueBlue: {
    color: '#00a8cc',
    fontWeight: 'bold',
  },
  
  // Booking Section
  bookingBanner: {
    backgroundColor: '#f8fdf8',
    borderWidth: 1,
    borderColor: '#e0eee0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderStyle: 'dashed',
  },
  bookingBannerLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888',
    marginRight: 5,
  },
  bookingBannerDates: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#00a86b',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerColumn: {
    width: '48%',
  },
  datePickerLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    color: '#888',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  datePickerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#555',
    marginLeft: 8,
  },
  
  // Action Buttons
  btnOrange: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  btnOrangeText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  btnBlue: {
    backgroundColor: '#2563eb', // royal blue
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnBlueText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
  },
  
  // Features Cards
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  featureCard: {
    backgroundColor: '#fffaf5',
    borderWidth: 1,
    borderColor: '#ffe4c4',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '31%',
    alignItems: 'center',
  },
  featureCardText: {
    fontSize: 10,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#282c3f',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default styles;
