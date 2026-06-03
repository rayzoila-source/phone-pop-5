const fetch = require('node-fetch');

const BASE_ID  = 'appneQX5pDz3OGfON';
const TABLE_ID = 'tblwfWGWqZbJ3V5Oa';

exports.handler = async (event) => {
  const API_KEY = process.env.AIRTABLE_API_KEY;
  if (!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'Missing API key' }) };

  const { rep, store } = event.queryStringParameters || {};
  if (!rep) return { statusCode: 400, body: JSON.stringify({ error: 'rep param required' }) };

  try {
    const formula = store
      ? `AND(LOWER({Salesperson})=LOWER("${rep}"),LOWER({Store})=LOWER("${store}"))`
      : `LOWER({Salesperson})=LOWER("${rep}")`;

    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set('filterByFormula', formula);
    url.searchParams.set('sort[0][field]', 'Date');
    url.searchParams.set('sort[0][direction]', 'desc');
    url.searchParams.set('maxRecords', '10');
    url.searchParams.set('fields[]', 'Call ID');
    url.searchParams.append('fields[]', 'Date');
    url.searchParams.append('fields[]', 'Customer Name');
    url.searchParams.append('fields[]', 'Vehicle of Interest');
    url.searchParams.append('fields[]', 'Self Score');
    url.searchParams.append('fields[]', 'Self Grade');
    url.searchParams.append('fields[]', 'Manager Score');
    url.searchParams.append('fields[]', 'Manager Grade');
    url.searchParams.append('fields[]', 'Appointment Set');
    url.searchParams.append('fields[]', 'Graded By');

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const result = await res.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ records: result.records || [] })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
