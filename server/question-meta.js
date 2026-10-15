// Editorial metadata for the question bank, layered over questions.js at load
// so question content and IDs never change. Gameplay history (matches,
// game_events) keys on question IDs, so IDs are never reused or removed.
//
//   titles   - player-facing title; `was` repeats the original title from
//              questions.js for review (the validator checks they still match).
//   inactive - not served anywhere (battles, practice, /api/question); kept for
//              history. `reason` is required; duplicates name the one kept.
//   tracks   - questions outside the default track for their category.
//              Default: quant -> trading, tech -> coding, ib -> investment_banking.
//              Only quant questions on the `trading` track enter quant battles.

// 51 titles that named the method or the famous problem (2026-10-15 audit).
const titles = {
  qe48: { title: "Two Strangers, One Date", was: "P(Matching Birthdays: 2 People)" },
  qe59: { title: "Two Out of Five", was: "Binomial Probability: 2 Successes in 5 Trials" },
  qm4: { title: "A Positive Result", was: "Bayes' Theorem: Medical Test" },
  qm5: { title: "Return for Taking Market Risk", was: "CAPM Expected Return" },
  qm2: { title: "Behind the Other Door", was: "Monty Hall Problem" },
  qm3: { title: "Waiting for a Six", was: "Geometric Distribution" },
  qm37: { title: "Testing Positive for Something Rare", was: "Bayes' Theorem: Disease Testing" },
  qm38: { title: "Rolling Until a Six", was: "Geometric Distribution: Expected Rolls" },
  qm40: { title: "Excess Return per Unit of Risk", was: "Sharpe Ratio" },
  qm41: { title: "Pricing the Matching Put", was: "Put-Call Parity" },
  qm42: { title: "Exactly Three Arrivals", was: "Poisson: P(X = 3)" },
  qm43: { title: "Return for Taking Market Risk (Repeat)", was: "CAPM Expected Return" },
  qm45: { title: "From $3 to $10", was: "Gambler's Ruin: P(Win)" },
  qm46: { title: "Average Time to Cash Flow", was: "Macaulay Duration" },
  qm47: { title: "How Much to Stake", was: "Kelly Criterion (2:1 Odds)" },
  qm48: { title: "A Coin Decides the Range", was: "Law of Total Expectation" },
  qm49: { title: "Switching Between Two States", was: "Markov Chain Steady State" },
  qm50: { title: "Three Successes Needed", was: "Negative Binomial: Expected Trials" },
  qm52: { title: "Low Roll or High Roll", was: "Law of Total Variance" },
  qm54: { title: "Time Between Trades", was: "Poisson: Expected Interarrival Time" },
  qm55: { title: "One Step Up or Down", was: "Risk-Neutral Probability (Binomial)" },
  qm61: { title: "A Crash-Free Day", was: "Poisson: P(Zero Events)" },
  qm62: { title: "Price Sensitivity to Yield", was: "Modified Duration" },
  qm64: { title: "Random Count, Random Successes", was: "Conditional Variance (Poisson-Binomial)" },
  qm65: { title: "Up Against the House", was: "Gambler's Ruin: Unfair Game" },
  qh4: { title: "A One-Period Tree", was: "Risk-Neutral Probability" },
  qh6: { title: "Risk-Adjusted Return of Portfolio B", was: "Sharpe Ratio Comparison" },
  qh3: { title: "A Hedged Book Moves 5%", was: "Options Delta Hedging P&L" },
  qh37: { title: "Drift of the Log Price", was: "Itô's Lemma: Drift of ln(S)" },
  qh38: { title: "Expected Square at Time 4", was: "Brownian Motion: E[W<sub>t</sub>²]" },
  qh40: { title: "A Call on an Up-or-Down Stock", was: "Binomial Option Pricing: Call" },
  qh41: { title: "Drift of the Squared Price", was: "Itô's Lemma: Drift of S²" },
  qh43: { title: "Hedge Ratio of a Call", was: "Black-Scholes Delta" },
  qh46: { title: "Touching 1.5 Before Time 1", was: "Reflection Principle: BM Maximum" },
  qh47: { title: "Variance Hidden in a Formula", was: "MGF: Identify Variance" },
  qh48: { title: "A Bound From the Mean Alone", was: "Markov's Inequality" },
  qh49: { title: "A Bound From the Mean and Variance", was: "Chebyshev's Inequality" },
  qh51: { title: "Lowest of Four Draws", was: "Order Statistics: Expected Minimum" },
  qh52: { title: "A $3 Move in the Underlying", was: "Delta-Gamma Approximation" },
  qh54: { title: "Stopped at +3 or −2", was: "Stopping Time: E[W<sub>τ</sub>²]" },
  qh55: { title: "An Exponential Transform at t = 1", was: "MGF of Exponential Distribution" },
  qh57: { title: "Summing Squared Moves", was: "Quadratic Variation of BM" },
  qh58: { title: "Sensitivity to Volatility", was: "Black-Scholes Vega" },
  qh59: { title: "Pinned at Time 4", was: "Brownian Bridge Expectation" },
  qh60: { title: "The Smallest Possible Second Moment", was: "Jensen's Inequality: E[X²] Bound" },
  qh61: { title: "Integrating a Path Against Itself", was: "Itô Integral Expectation" },
  qh62: { title: "Averaging Two Opposed Estimates", was: "Antithetic Variates Variance Reduction" },
  qh64: { title: "A Put Over Two Steps", was: "Two-Period Binomial Put" },
  qh66: { title: "How Many for a Shared Day?", was: "The Birthday Problem" },
  qh68: { title: "Groups Versus a Single Match", was: "Comparing Two Birthday Problems" },
  qh71: { title: "$1 Against $2, With an Edge", was: "Ruin with a Skill Edge" },
  // Decision restored (2026-10-15); the old title described the removed fixed order.
  qe67: { title: "Choosing the Order of Opponents", was: "Best of Three, Weaker Opponent Twice" },
};

// Near-exact duplicates (2026-10-15 audit). The kept version is the one a
// candidate can work out without a calculator, or the better-formatted one.
const inactive = {
  qm3:  { reason: 'duplicate', keep: 'qe69', note: 'Expected rolls until a 6; three copies existed' },
  qm38: { reason: 'duplicate', keep: 'qe69', note: 'Expected rolls until a 6; three copies existed' },
  qm37: { reason: 'duplicate', keep: 'qm4',  note: 'Same Bayes test setup; qm4 resolves to 1/3 mentally, qm37 needs 4 dp' },
  qm55: { reason: 'duplicate', keep: 'qh4',  note: 'Same one-step risk-neutral probability; qh4 uses simple rates (0.75), qm55 needs e^0.05' },
  qm43: { reason: 'duplicate', keep: 'qm5',  note: 'Identical CAPM numbers; qm5 is the formatted version' },
  qm67: { reason: 'duplicate', keep: 'qm66', note: 'Same "both pick the same option" setup with 5 options instead of 10' },
};

// Off-trading quant questions (2026-10-15 audit): still in Practice, never in
// quant battles. Descriptive-statistics items (qe37, qe38, qe57, qe62) and
// qh73 await a decision and stay on trading for now.
const CF = 'corporate_finance', SC = 'stochastic_calculus';
const tracks = {
  // Corporate finance: returns, interest, bonds, CAPM, Sharpe
  qe3: CF, qe6: CF, qe34: CF, qe39: CF, qe44: CF, qe49: CF, qe52: CF, qe54: CF, qe64: CF,
  qm5: CF, qm43: CF, qm46: CF, qm58: CF, qm62: CF, qh6: CF,
  // Stochastic calculus: Brownian motion, GBM, Itô
  qm60: SC, qh37: SC, qh38: SC, qh39: SC, qh41: SC, qh42: SC, qh50: SC, qh57: SC, qh59: SC, qh61: SC, qh63: SC,
};

module.exports = { titles, inactive, tracks };
