export const companyInfo = {
  name: 'VOUGE RETAIL PRIVATE LIMITED',
  cin: 'U47912MH2025PTC444156',
  gst: '06AAKCV9002C1ZJ',
  address: {
    line1: 'Off N-271, P N-20, Sec 19D, Satra Plaza Co-op Society',
    city: 'Thane',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400705',
  },
}

export function formatCompanyAddress(info = companyInfo) {
  const { line1, city, state, country, pincode } = info.address
  return `${line1}, ${city}, ${state}, ${country} – ${pincode}`
}
