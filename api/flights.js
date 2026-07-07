// api/flights.js
// Proxy آمن لـ Sky Scrapper (Air Scraper) API عبر RapidAPI
// يخبي مفتاح RAPIDAPI_KEY من جهة السيرفر، ويمرر الطلب من التطبيق إلى الـ API الحقيقي

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

// نفس فلسفة hotels.js: قائمة بيضاء بالـ endpoints المسموح استخدامها فقط
// (بلاش نفتح كل الـ API للعالم، بس اللي نحتاجه فعلياً)
const allowedPaths = [
  'api/v1/flights/searchAirport',
  'api/v1/flights/getNearByAirports',
  'api/v1/flights/searchFlights',        // Version 2 - البحث الفعلي عن الرحلات
  'api/v1/flights/getPriceCalendar',
  'api/v1/flights/getFlightDetails',
];

module.exports = async function handler(req, res) {
  try {
    const { path, ...queryParams } = req.query;

    if (!path) {
      return res.status(400).json({ error: 'Missing "path" query parameter' });
    }

    if (!allowedPaths.includes(path)) {
      return res.status(403).json({ error: 'This path is not allowed', path });
    }

    // تحويل باقي الباراميترات (originSkyId, date, ...) إلى query string
    const qs = new URLSearchParams(queryParams).toString();
    const url = `https://${RAPIDAPI_HOST}/${path}${qs ? `?${qs}` : ''}`;

    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // نفس المتغيّر المستخدم بـ hotels.js
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    const data = await apiResponse.json();

    // مهم: ما نكرر هيدرز CORS هون — هي معرّفة مرة وحدة بس بملف vercel.json
    // (نفس الدرس اللي تعلمناه من مشكلة hotels.js)
    return res.status(apiResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
};
