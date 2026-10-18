export const HARD_CAP_MINOR = 1000000; // ৳10,000 per demo payment
export const RESERVE_MINOR = 200000;   // ৳2,000 demo reserve

const bdDigits = '০১২৩৪৫৬৭৮৯';
export function asciiDigits(value) {
  return String(value ?? '').replace(/[০-৯]/g, (d) => String(bdDigits.indexOf(d)));
}

export function amountToMinor(value) {
  const raw = asciiDigits(value).trim().replace(/^৳\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?$/.test(raw)) return null;
  const input = raw.replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(input)) return null;
  const [whole, fraction = ''] = input.split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(minor) && minor >= 0 ? minor : null;
}

export function money(minor) {
  return `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(minor / 100)}`;
}

export function monthKey(date) {
  return String(date).slice(0, 7);
}

export function wilsonLowerBound(successes, total, z = 1.96) {
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(successes) || total <= 0 || successes < 0 || successes > total) return 0;
  const p = successes / total;
  const z2 = z * z;
  return (p + z2 / (2 * total) - z * Math.sqrt(p * (1 - p) / total + z2 / (4 * total * total))) / (1 + z2 / total);
}

export function trustTier(successes, total, unsafe = false) {
  if (unsafe) return 0;
  const lower = wilsonLowerBound(successes, total);
  if (total >= 80 && lower >= 0.95) return 3;
  if (total >= 40 && lower >= 0.90) return 2;
  if (total >= 20 && lower >= 0.80) return 1;
  return 0;
}

export function accountBalance(account, transactions, accounts) {
  if (!account) return NaN;
  if (account.type === 'debit') {
    const bank = accounts.find(a => a.id === account.linkedTo && a.type === 'bank' && a.active);
    return bank ? accountBalance(bank, transactions, accounts) : NaN;
  }
  if (account.type === 'credit') {
    const spent = transactions.filter(t => t.accountId === account.id && t.status === 'posted' && t.kind === 'expense')
      .reduce((sum, t) => sum + t.amountMinor, 0);
    return Math.max(0, (account.creditLimitMinor || 0) - spent);
  }
  const direct = transactions.filter(t => t.accountId === account.id && t.status === 'posted')
    .reduce((sum, t) => sum + (t.kind === 'income' ? t.amountMinor : t.kind === 'expense' ? -t.amountMinor : 0), 0);
  const debitCards = accounts.filter(a => a.type === 'debit' && a.linkedTo === account.id).map(a => a.id);
  const cardSpend = transactions.filter(t => debitCards.includes(t.accountId) && t.status === 'posted' && t.kind === 'expense')
    .reduce((sum, t) => sum + t.amountMinor, 0);
  return (account.openingMinor || 0) + direct - cardSpend;
}

export function monthSummary(transactions, selectedMonth) {
  const rows = transactions.filter(t => monthKey(t.date) === selectedMonth && t.status === 'posted');
  const expenses = rows.filter(t => t.kind === 'expense');
  const income = rows.filter(t => t.kind === 'income');
  const spendMinor = expenses.reduce((sum, t) => sum + t.amountMinor, 0);
  const incomeMinor = income.reduce((sum, t) => sum + t.amountMinor, 0);
  const byCategory = {};
  for (const t of expenses) byCategory[t.category] = (byCategory[t.category] || 0) + t.amountMinor;
  return { rows, expenses, income, spendMinor, incomeMinor, netMinor: incomeMinor - spendMinor, byCategory };
}

export function riskSignals({ payee = '', amountMinor = 0, category = '', knownPayees = [], baselineMinor = 0, newDevice = false, foreign = false }) {
  const signals = [];
  if (!knownPayees.map(x => x.toLowerCase()).includes(String(payee).toLowerCase())) signals.push('New or unrecognized payee');
  if (baselineMinor > 0 && amountMinor > baselineMinor * 2) signals.push('Amount is more than twice the usual amount');
  if (amountMinor >= 500000) signals.push('High amount');
  if (newDevice) signals.push('New device');
  if (foreign) signals.push('Unexpected location');
  if (category === 'Uncategorized') signals.push('Category needs review');
  return signals;
}

export function assessPayment(proposal, { knownPayees = [], availableMinor = NaN, alreadyPaidRefs = [], trust = { successes: 0, total: 0 }, currentDate = new Date().toISOString().slice(0,10) } = {}) {
  const reasons = [];
  if (!Number.isSafeInteger(proposal.amountMinor) || proposal.amountMinor <= 0) reasons.push('Amount must be greater than zero');
  if (proposal.amountMinor > HARD_CAP_MINOR) reasons.push('Over the demo hard cap of ৳10,000');
  if (!proposal.payee?.trim()) reasons.push('Payee is required');
  if (proposal.reference && alreadyPaidRefs.includes(proposal.reference)) reasons.push('This bill was already paid');
  if (proposal.kind === 'bill' && proposal.dueDate && proposal.dueDate < currentDate) reasons.push('Bill is overdue; review with the provider');
  if (availableMinor - proposal.amountMinor < RESERVE_MINOR) reasons.push('Emergency reserve would be breached');
  if (!Number.isSafeInteger(availableMinor)) reasons.push('Available balance could not be verified');
  const signals = riskSignals({ ...proposal, knownPayees });
  const tier = trustTier(trust.successes || 0, trust.total || 0, trust.unsafe || false);
  return { allowed: reasons.length === 0, reasons, signals, tier, needsSecondDevice: signals.length > 0 };
}

export function parseIntent(message, bills = []) {
  const text = asciiDigits(message).trim();
  if (!/^(?:please\s+)?(?:send|transfer|pay|pathao|পাঠাও|পাঠাতে চাই)\s+/i.test(text) || /[?]|\b(?:not|never|don't|cancel)\b/i.test(text)) return null;
  const send = text.match(/^(?:please\s+)?(?:send|transfer|pathao|পাঠাও|পাঠাতে চাই)\s+৳?\s*(\d+(?:\.\d{1,2})?)\s*(?:taka|tk|টাকা)?\s*(?:to|ke|কে)\s+(.+)$/i);
  if (send) return { kind: 'transfer', amountMinor: amountToMinor(send[1]), payee: send[2].trim().replace(/[.!?]+$/, '') };
  const bill = bills.find(b => text.toLowerCase().includes(b.name.toLowerCase()) || text.toLowerCase().includes(b.payee.toLowerCase()));
  if (bill && /pay|bill|দাও|পরিশোধ|dao/i.test(text)) return { kind: 'bill', billId: bill.id, amountMinor: bill.amountMinor, payee: bill.payee };
  return null;
}

export function adviceFor(transactions, selectedMonth, skills = '') {
  const summary = monthSummary(transactions, selectedMonth);
  const categories = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]);
  const tips = [];
  if (categories.length) {
    const [top, amount] = categories[0];
    tips.push({ title: `${top} is your largest expense`, body: `${money(amount)} went to ${top.toLowerCase()} this month. Review the individual purchases before changing your budget.`, tone: 'insight' });
  }
  const subscriptions = summary.byCategory.Subscriptions || 0;
  if (subscriptions >= 30000) tips.push({ title: 'Review recurring services', body: `${money(subscriptions)} in subscriptions this month is ${money(subscriptions * 12)} over a year if it continues. Keep the services you actively use.`, tone: 'save' });
  const cash = summary.expenses.filter(t => t.source === 'cash').reduce((sum, t) => sum + t.amountMinor, 0);
  if (cash === 0) tips.push({ title: 'Add cash spending', body: 'Cash purchases are not yet recorded this month. Add them to make the report more complete.', tone: 'quality' });
  if (summary.netMinor < 0) tips.push({ title: 'Spending exceeds recorded income', body: `Recorded spending is ${money(-summary.netMinor)} above recorded income. Check whether income is missing before acting on this number.`, tone: 'alert' });
  else if (summary.incomeMinor > 0) tips.push({ title: 'Your recorded surplus', body: `${money(summary.netMinor)} remains after recorded expenses. Consider your emergency fund and any essential upcoming bills before allocating it.`, tone: 'insight' });
  const s = skills.toLowerCase();
  const idea = /teach|tutor|শিক্ষ|পড়া/.test(s) ? 'Offer a small tutoring session based on a subject you already know.'
    : /design|draw|edit|ডিজাইন/.test(s) ? 'Test a small design or editing project using a portfolio of your own work.'
    : /code|program|web|কোড/.test(s) ? 'Try one paid website or automation task with a clear, limited scope.'
    : 'List one skill you can teach or sell, then test a small paid project before investing money in it.';
  tips.push({ title: 'A possible income experiment', body: `${idea} This is an idea, not a promise of earnings.`, tone: 'income' });
  return { summary, tips };
}

export function assessCardPurchase(request, accounts, transactions) {
  const card = accounts.find(a => a.id === request.accountId && a.active && ['debit','credit'].includes(a.type));
  const reasons = [];
  if (!card) reasons.push('Card is unavailable');
  if (!request.merchant?.trim()) reasons.push('Merchant is required');
  if (!Number.isSafeInteger(request.amountMinor) || request.amountMinor <= 0) reasons.push('Invalid amount');
  if (request.amountMinor > HARD_CAP_MINOR) reasons.push('Over the demo payment cap');
  const available = accountBalance(card, transactions, accounts);
  const reserve = card?.type === 'debit' ? RESERVE_MINOR : 0;
  if (!Number.isSafeInteger(available) || available - request.amountMinor < reserve) reasons.push('Insufficient available funds or credit');
  if (transactions.some(t => t.cardRequestId === request.id)) reasons.push('Request already posted');
  return { allowed: reasons.length === 0, reasons };
}

// Synthetic decision fixtures: a passed check means the expected allow/hold decision matched.
// These are software checks, not observed human decisions or evidence of production trust.
export function runReplayBatch(offset = 0) {
  const outcomes = [];
  for (let i=offset; i<Math.min(offset+20,80); i++) {
    const p={payee:'Fixture Utility',amountMinor:50000+i*100,reference:`FIX-${i}`,kind:'bill',dueDate:'2026-11-01'};
    const context={knownPayees:['Fixture Utility'],availableMinor:2000000,currentDate:'2026-10-18',alreadyPaidRefs:[]};
    let expectedAllowed=true, expectedReview=false;
    switch(i%5) {
      case 1: p.amountMinor=HARD_CAP_MINOR+1+i; expectedAllowed=false; break;
      case 2: context.availableMinor=p.amountMinor+RESERVE_MINOR-1; expectedAllowed=false; break;
      case 3: context.alreadyPaidRefs=[p.reference]; expectedAllowed=false; break;
      case 4: p.payee=`New fixture payee ${i}`; expectedReview=true; break;
    }
    const actual=assessPayment(p,context);
    outcomes.push({id:`fixture-${i}`,expectedAllowed,actualAllowed:actual.allowed,expectedReview,actualReview:actual.needsSecondDevice,passed:actual.allowed===expectedAllowed && (!expectedAllowed || actual.needsSecondDevice===expectedReview)});
  }
  return outcomes;
}

export function budgetStatus(transactions, month, limitMinor) {
  const spentMinor=monthSummary(transactions,month).spendMinor;
  const valid=Number.isSafeInteger(limitMinor)&&limitMinor>0;
  return {spentMinor,limitMinor:valid?limitMinor:0,remainingMinor:valid?limitMinor-spentMinor:0,overBudget:valid&&spentMinor>limitMinor};
}
