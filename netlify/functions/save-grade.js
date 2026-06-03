const fetch = require('node-fetch');

const BASE_ID  = 'appneQX5pDz3OGfON';
const TABLE_ID = 'tblwfWGWqZbJ3V5Oa';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.AIRTABLE_API_KEY;
  if (!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'Missing API key' }) };

  try {
    const data = JSON.parse(event.body);

    const callId = `PP-${Date.now()}-${Math.random().toString(36).substr(2,4).toUpperCase()}`;

    const gradeLabel = (score) => {
      if (score >= 90) return '🏆 Championship';
      if (score >= 75) return '⭐ All-Star';
      if (score >= 60) return '🔥 Pro Level';
      if (score >= 45) return '⚡ Rookie';
      return '📋 Needs Coaching';
    };

    const isManager = data.gradedBy === 'Manager';

    const fields = {
      'Call ID':                          callId,
      'Date':                             new Date().toISOString(),
      'Store':                            data.store        || '',
      'Salesperson':                      data.rep          || '',
      'Customer Name':                    data.customerName || '',
      'Vehicle of Interest':              data.vehicle      || '',
      'Trade-In':                         data.trade        || '',
      'Appointment Set':                  !!data.appointmentSet,
      'Answered Within 3 Rings':          !!data.answeredRings,
      'Step 1 - Asked Current Vehicle':   !!data.step1,
      'Step 2 - Asked Who Car Is For':    !!data.step2,
      'Step 3 - Asked Financing':         !!data.step3,
      'Step 4 - Asked Other Dealers':     !!data.step4,
      'Step 5 - Asked Open to Other Model': !!data.step5,
      'No Price Quoted':                  !!data.noPriceQuoted,
      'Asked for Appointment':            !!data.askedForAppt,
      'Confirmed by Text':                !!data.confirmedByText,
      'Graded By':                        data.gradedBy || 'Self',
      'Notes':                            data.notes || ''
    };

    if (isManager) {
      fields['Manager Score'] = data.score || 0;
      fields['Manager Grade'] = gradeLabel(data.score || 0);
    } else {
      fields['Self Score'] = data.score || 0;
      fields['Self Grade'] = gradeLabel(data.score || 0);
    }

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fields })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message || 'Airtable error');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: result.id, callId })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
