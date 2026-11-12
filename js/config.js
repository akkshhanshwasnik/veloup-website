// Website configuration
// All values in this file are visible to anyone who views the site

const config = {
  bookingLink: "https://calendly.com/akkshhanshwasnik-veloup/free-call",
  whatsappNumber: "+918669614407",
  businessEmail: "hello@veloup.in",
  formEndpoint: "https://script.google.com/macros/s/AKfycbw_HxVZKCYG4_Zw4Onki76Z2wX4cc9FS4ikncjAgVoJWga5zan2K77pKEzvCX3Feyzz/exec",
  whatsappMessage: "Hi, I'd like to know more about VeloUp"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  // Browser environment
  window.config = config;
}