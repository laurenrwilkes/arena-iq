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

const titles = {};

const inactive = {};

const tracks = {};

module.exports = { titles, inactive, tracks };
